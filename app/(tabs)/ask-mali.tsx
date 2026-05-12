import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@gluestack-ui/themed';
import { themes } from '@/constants/theme';
import { Fonts } from '@/constants/fonts';

// ─── Design tokens ────────────────────────────────────────────────────────────
const theme = themes.dark; // Use the dark theme for alignment

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'user' | 'assistant';
type ChatMessage = { role: Role; text: string; id: string };

// ─── Quick-reply chips (same as design) ──────────────────────────────────────
const QUICK_REPLIES = [
  'Why are prices increasing?',
  'How can I save money?',
  'Explain inflation simply?',
  'Will fuel prices drop soon?',
];

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Mali, an AI economic assistant built for Kenyan households and businesses. You explain real-world economic events — fuel prices, forex (USD/KES), food basket costs, electricity tariffs, CPI inflation — in plain, friendly language that everyday Kenyans can understand and act on.

Always answer in 2–4 short sentences. Be specific to Kenya: use KES amounts, Nairobi context, local retailers (Quickmart, Naivas), and real institutions (EPRA, CBK, KPLC). 

Never say you're Claude or made by Anthropic. You are Mali, built by MaliMind.`;

// ─── Call Claude API ──────────────────────────────────────────────────────────
async function callMali(history: ChatMessage[]): Promise<string> {
  const messages = history.map((m) => ({ role: m.role, content: m.text }));

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const text = data?.content?.find((b: any) => b.type === 'text')?.text;
  if (!text) throw new Error('Empty response');
  return text.trim();
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <View style={chat.typingBubble}>
      <View style={chat.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[chat.dot, { opacity: 0.4 + i * 0.2 }]} />
        ))}
      </View>
    </View>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[chat.row, isUser ? chat.rowUser : chat.rowAssistant]}>
      {!isUser && (
        <View style={chat.avatar}>
          <Text style={chat.avatarText}>✦</Text>
        </View>
      )}
      <View
        style={[
          chat.bubble,
          isUser ? chat.bubbleUser : chat.bubbleAssistant,
        ]}
      >
        <Text style={[chat.bubbleText, isUser ? chat.bubbleTextUser : chat.bubbleTextAssistant]}>
          {msg.text}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AskMaliScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isTyping) scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = { role: 'user', text: trimmed, id: `u-${Date.now()}` };
      const nextHistory = [...messages, userMsg];

      setMessages(nextHistory);
      setQuery('');
      setIsTyping(true);
      setError(null);

      try {
        const reply = await callMali(nextHistory);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: reply, id: `a-${Date.now()}` },
        ]);
      } catch {
        setError('Mali couldn\'t respond. Check your connection and try again.');
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping]
  );

  const showIntro = messages.length === 0;

  return (
    <SafeAreaView style={sc.screen} edges={['top']}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={sc.header}>
        <View style={sc.headerIconWrap}>
          <Text style={sc.headerIcon}>✦</Text>
        </View>
        <Text style={sc.headerTitle}>Ask Mali</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Messages ──────────────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={sc.scroll}
          contentContainerStyle={[sc.scrollContent, showIntro && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {showIntro ? (
            /* ── Intro state ─────────────────────────────────────────────── */
            <View style={sc.intro}>
              <View style={sc.introAvatarWrap}>
                <View style={sc.introAvatar}>
                  <Text style={sc.introAvatarIcon}>✦</Text>
                </View>
                <View style={sc.introOnline} />
              </View>

              <View style={sc.introCard}>
                <Text style={sc.introGreeting}>Hi, I'm Mali 👋</Text>
                <Text style={sc.introSub}>
                  Your AI economic assistant.{'\n'}Ask me anything about prices,{'\n'}trends, or how it affects you.
                </Text>
              </View>

              {/* Quick replies on intro */}
              <View style={sc.quickWrap}>
                {QUICK_REPLIES.map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={sc.quickChip}
                    activeOpacity={0.7}
                    onPress={() => sendMessage(q)}
                  >
                    <Text style={sc.quickChipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            /* ── Chat messages ────────────────────────────────────────────── */
            <View style={sc.bubbleList}>
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}
              {isTyping && <TypingDots />}
              {error && (
                <View style={sc.errorBubble}>
                  <Text style={sc.errorText}>{error}</Text>
                </View>
              )}

              {/* Quick chips after last assistant reply */}
              {!isTyping && messages[messages.length - 1]?.role === 'assistant' && (
                <View style={sc.inlineQuick}>
                  {QUICK_REPLIES.slice(0, 3).map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={sc.quickChipSmall}
                      activeOpacity={0.7}
                      onPress={() => sendMessage(q)}
                    >
                      <Text style={sc.quickChipSmallText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Input bar ─────────────────────────────────────────────────────── */}
        <View style={sc.inputWrap}>
          <View style={sc.inputRow}>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Ask anything..."
              placeholderTextColor={theme.textDim}
              style={sc.input}
              multiline
              maxLength={400}
              onSubmitEditing={() => sendMessage(query)}
              blurOnSubmit={false}
              returnKeyType="send"
            />
            <Pressable
              style={[sc.sendBtn, (!query.trim() || isTyping) && sc.sendBtnDisabled]}
              onPress={() => sendMessage(query)}
              disabled={!query.trim() || isTyping}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={sc.sendIcon}>➤</Text>
              )}
            </Pressable>
          </View>
          <Text style={sc.disclaimer}>Mali can make mistakes. Verify important info.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Chat bubble styles ───────────────────────────────────────────────────────
const chat = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  rowAssistant: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  rowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    maxWidth: '80%',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.greenDim,
    borderWidth: 1,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    color: theme.primary,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  bubbleAssistant: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: theme.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextAssistant: {
    color: theme.text,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    marginLeft: 38,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.textDim,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  headerIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.greenDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 13,
    color: theme.primary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.2,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Intro state
  intro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 20,
  },
  introAvatarWrap: {
    position: 'relative',
  },
  introAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.greenDim,
    borderWidth: 2,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  introAvatarIcon: {
    fontSize: 32,
    color: theme.primary,
  },
  introOnline: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: theme.background,
  },
  introCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  introGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  introSub: {
    fontSize: 14,
    color: theme.textDim,
    textAlign: 'center',
    lineHeight: 22,
  },
  quickWrap: {
    width: '100%',
    gap: 10,
  },
  quickChip: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    width: '100%',
  },
  quickChipText: {
    fontSize: 14,
    color: theme.textDim,
    fontWeight: '500',
  },

  // Bubble list
  bubbleList: {
    paddingBottom: 8,
  },
  inlineQuick: {
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 38,
  },
  quickChipSmall: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  quickChipSmallText: {
    fontSize: 13,
    color: theme.textDim,
  },

  // Error
  errorBubble: {
    backgroundColor: 'rgba(240,91,91,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(240,91,91,0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#F05B5B',
    lineHeight: 19,
  },

  // Input
  inputWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    backgroundColor: theme.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 13,
    fontSize: 15,
    color: theme.text,
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(11,143,77,0.35)',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 2,
  },
  disclaimer: {
    fontSize: 11,
    color: theme.textDim,
    textAlign: 'center',
    marginTop: 10,
  },
});