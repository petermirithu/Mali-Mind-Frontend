import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl } from '@/services/api';

export type Role = 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  text: string;
  id: string;
};

type WsEvent = {
  type?: string;
  message?: string;
  text?: string;
  chunk?: string;
  content?: string;
  response?: string;
  answer?: string;
  done?: boolean;
  final?: boolean;
  is_final?: boolean;
  items?: string[];
  data?: unknown;
  meta?: Record<string, unknown>;
};

type UseMaliChatOptions = {
  userId: number;
  setQuery: (text: string) => void;
};

type UseMaliChatResult = {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  suggestions: string[];
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
};

function normalizeWsUrl(baseUrl: string, wsPath: string): string {
  const trimmedBase = baseUrl.trim().replace(/\/+$/, '');
  if (!trimmedBase) {
    throw new Error('Missing websocket base URL');
  }

  let normalizedBase = trimmedBase;
  if (/^https?:\/\//i.test(normalizedBase)) {
    normalizedBase = normalizedBase.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
  }

  const normalizedPath = wsPath.startsWith('/') ? wsPath : `/${wsPath}`;
  return `${normalizedBase}${normalizedPath}`;
}

function toBackendHistory(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role,
    content: m.text,
  }));
}

function getEventText(event: WsEvent): string {
  return event.chunk ?? event.text ?? event.content ?? event.response ?? event.answer ?? event.message ?? '';
}

function isFinalEvent(event: WsEvent): boolean {
  const t = (event.type ?? '').toLowerCase();
  return (
    event.done === true ||
    event.final === true ||
    event.is_final === true ||
    t === 'done' ||
    t === 'complete' ||
    t === 'completed' ||
    t === 'final'
  );
}

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (m): m is ChatMessage =>
      !!m &&
      typeof m === 'object' &&
      'role' in m &&
      'text' in m &&
      'id' in m &&
      ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant') &&
      typeof (m as ChatMessage).text === 'string' &&
      typeof (m as ChatMessage).id === 'string'
  );
}

function sanitizeSuggestions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

export function useMaliChat(options: UseMaliChatOptions): UseMaliChatResult {
  const { userId, setQuery } = options;

  const wsBaseUrl = baseUrl;
  const wsPath = '/mali/chat/ws';

  if (!wsBaseUrl) {
    throw new Error('Missing API base URL in environment variables');
  }

  const wsUrl = useMemo(() => normalizeWsUrl(wsBaseUrl, wsPath), [wsBaseUrl, wsPath]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`mali-chat${userId.toString()}`);
        if (!raw || !mounted) return;
        const parsed = JSON.parse(raw);
        const sanitized = sanitizeMessages(parsed);
        setMessages(sanitized);
      } catch {
        // ignore persistence errors
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(`mali-chat${userId.toString()}`, JSON.stringify(messages)).catch(() => {
      // ignore persistence errors
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const openSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(String(evt.data)) as WsEvent;
        const type = (data.type ?? '').toLowerCase();

        if (type === 'error') {
          setError(data.message || 'Mali could not respond right now.');
          setIsTyping(false);
          activeAssistantIdRef.current = null;
          return;
        }

        if (type === 'suggestions') {
          const backendSuggestions = sanitizeSuggestions(data.items);
          setSuggestions(backendSuggestions);
          return;
        }

        if (type === 'tool_result') {
          return;
        }

        const incomingText = getEventText(data);
        if (!incomingText && !isFinalEvent(data)) return;

        if (!activeAssistantIdRef.current) {
          const assistantId = `a-${Date.now()}`;
          activeAssistantIdRef.current = assistantId;
          setMessages((prev) => [...prev, { role: 'assistant', text: incomingText, id: assistantId }]);
        } else if (incomingText) {
          const activeId = activeAssistantIdRef.current;
          setMessages((prev) => prev.map((m) => (m.id === activeId ? { ...m, text: `${m.text}${incomingText}` } : m)));
        }

        if (isFinalEvent(data)) {
          setIsTyping(false);
          activeAssistantIdRef.current = null;
        }
      } catch {
        setError('Received malformed server message.');
        setIsTyping(false);
        activeAssistantIdRef.current = null;
      }
    };

    ws.onerror = () => {
      setError('Socket error. Please check your connection.');
      setIsTyping(false);
      activeAssistantIdRef.current = null;
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    wsRef.current = ws;
    return ws;
  }, [wsUrl]);

  const sendThroughSocket = useCallback(
    async (text: string, nextHistory: ChatMessage[]) => {
      const ws = openSocket();

      if (ws.readyState === WebSocket.CONNECTING) {
        await new Promise<void>((resolve, reject) => {
          const onOpen = () => {
            ws.removeEventListener('open', onOpen as EventListener);
            ws.removeEventListener('error', onError as EventListener);
            resolve();
          };
          const onError = () => {
            ws.removeEventListener('open', onOpen as EventListener);
            ws.removeEventListener('error', onError as EventListener);
            reject(new Error('WebSocket connection failed'));
          };
          ws.addEventListener('open', onOpen as EventListener);
          ws.addEventListener('error', onError as EventListener);
        });
      }

      if (ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not open');
      }

      ws.send(
        JSON.stringify({
          message: text,
          user_id: userId,
          chat_history: toBackendHistory(nextHistory),
        })
      );
    },
    [openSocket, userId]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMessage: ChatMessage = {
        role: 'user',
        text: trimmed,
        id: `u-${Date.now()}`,
      };

      const nextHistory = [...messages, userMessage];

      setMessages(nextHistory);
      setQuery('');
      setError(null);
      setIsTyping(true);
      setSuggestions([]);

      try {
        await sendThroughSocket(trimmed, nextHistory);
      } catch {
        setError('Mali could not respond right now. Check your connection and try again.');
        setIsTyping(false);
        activeAssistantIdRef.current = null;
      }
    },
    [isTyping, messages, sendThroughSocket]
  );

  const clearChat = useCallback(async () => {
    setMessages([]);
    setError(null);
    setIsTyping(false);
    setSuggestions([]);
    activeAssistantIdRef.current = null;
    await AsyncStorage.removeItem(`mali-chat${userId.toString()}`).catch(() => {
      // ignore persistence errors
    });
  }, []);

  return {
    messages,
    isTyping,
    error,
    suggestions,
    sendMessage,
    clearChat,
  };
}