import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts } from '@/constants/fonts';
import { useTheme } from '@/contexts/theme-context';
import { useMaliChat } from '@/hooks/user-mali-chat';
import { useAssets } from 'expo-asset';
import { Image } from '@gluestack-ui/themed';
import Bubble from '@/components/mali-chat/bubble';


type Role = 'user' | 'assistant';
type ChatMessage = { role: Role; text: string; id: string };

const QUICK_REPLIES = [
  'Why are food prices rising this week?',
  'How can I cut my household costs?',
  'Explain inflation in simple terms.',
  'Will fuel prices likely ease soon?',
];


export default function AskMaliScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [assets] = useAssets([
    require('../assets/animations/typing.gif'),
  ]);

  const [query, setQuery] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  const { messages, isTyping, error, suggestions, sendMessage, clearChat } = useMaliChat({
    userId: 1,
    setQuery: (text: string) => setQuery(text),
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [isTyping, messages, scrollToBottom]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const startNewChat = useCallback(() => {
    if (messages.length === 0 && !query.trim()) return;

    Alert.alert('Start new chat?', 'This clears your current conversation.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Chat',
        style: 'destructive',
        onPress: async () => {
          clearChat();
          setQuery('');
        },
      },
    ]);
  }, [messages.length, query]);

  const showIntro = messages.length === 0;

  function TypingDots({
    bubbleColor,
    borderColor,
  }: {
    bubbleColor: string;
    borderColor: string;
  }) {
    if (!assets) return null;
    return (
      <View style={[styles.typingBubble, { backgroundColor: bubbleColor, borderColor }]}>
        <Image
          source={{ uri: assets[0].localUri ?? assets[0].uri }}
          style={{ width: 50, height: 20 }}
          alt="Typing indicator"
        />
      </View>
    );
  }

  if (!assets) {
    return (
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
      }} edges={['top', 'bottom']}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ActivityIndicator size="large" color={"#0B8F4D"} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              activeOpacity={0.7}
              onPress={handleBack}
            >
              <MaterialIcons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.headerCopy}>
              <Text style={[styles.sectionLabel, { color: theme.textDim }]}>AI ECONOMIC ASSISTANT</Text>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Ask Mali</Text>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, showIntro && styles.scrollContentIntro]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {showIntro ? (
              <View style={styles.intro}>
                <View
                  style={[
                    styles.botCard,
                    {
                      backgroundColor: theme.primaryDim,
                      borderColor: theme.greenGlow,
                    },
                  ]}
                >
                  <View style={styles.botTop}>
                    <View style={[styles.botBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.botBadgeText}>✦</Text>
                    </View>
                    <View style={styles.botCopy}>
                      <Text style={[styles.botName, { color: theme.text }]}>Mali</Text>
                      <Text style={[styles.botTagline, { color: theme.textDim }]}>Your weekly cost-of-living guide</Text>
                    </View>
                  </View>
                  <Text style={[styles.botIntro, { color: theme.text }]}>
                    I can break down food basket changes, fuel movement, and forex trends into quick, actionable insights
                    for Kenyan households.
                  </Text>
                </View>

                <View style={styles.quickWrap}>
                  <Text style={[styles.sectionLabel, { color: theme.textDim }]}>TRY ASKING</Text>
                  <View style={styles.quickGrid}>
                    {QUICK_REPLIES.map((quickReply, idx) => (
                      <TouchableOpacity
                        key={quickReply}
                        style={[
                          styles.quickCard,
                          {
                            backgroundColor: theme.card,
                            borderColor: idx % 2 === 0 ? theme.greenGlow : theme.cardBorder,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => sendMessage(quickReply)}
                      >
                        <MaterialIcons
                          name={idx % 2 === 0 ? 'trending-up' : 'insights'}
                          size={16}
                          color={idx % 2 === 0 ? theme.primary : theme.textDim}
                        />
                        <Text style={[styles.quickCardText, { color: theme.text }]}>{quickReply}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.bubbleList}>
                <View style={styles.inChatBotHeader}>
                  <View style={[styles.inChatBotDot, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.inChatBotLabel, { color: theme.primary }]}>MALI</Text>
                </View>

                {messages.map((msg) => (
                  <Bubble
                    key={msg.id}
                    msg={msg}
                    primary={theme.primary}
                    text={theme.text}
                    textDim={theme.textDim}
                    card={theme.card}
                    cardBorder={theme.cardBorder}
                  />
                ))}

                {isTyping && assets[0] && (
                  <TypingDots bubbleColor={theme.card} borderColor={theme.cardBorder} />
                )}

                {error && (
                  <View style={[styles.errorBubble, { backgroundColor: theme.dangerDim, borderColor: theme.danger }]}>
                    <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
                  </View>
                )}

                {!isTyping && messages[messages.length - 1]?.role === 'assistant' && suggestions.length > 0 && (
                  <View style={styles.inlineQuick}>
                    {suggestions.slice(0, 3).map((quickReply) => (
                      <TouchableOpacity
                        key={quickReply}
                        style={[styles.quickChipSmall, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                        activeOpacity={0.7}
                        onPress={() => sendMessage(quickReply)}
                      >
                        <Text style={[styles.quickChipSmallText, { color: theme.textDim }]}>{quickReply}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputWrap, { backgroundColor: theme.background, borderTopColor: theme.cardBorder }]}>
            <View style={[styles.composerRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Pressable
                style={[styles.newChatBtn, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                onPress={startNewChat}
              >
                <MaterialIcons name="add" size={22} color={theme.text} />
              </Pressable>

              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Ask about fuel, forex, or food prices..."
                placeholderTextColor={theme.textDim}
                style={[styles.input, { color: theme.text }]}
                multiline
                maxLength={400}
                onSubmitEditing={() => sendMessage(query)}
                blurOnSubmit={false}
                returnKeyType="send"
              />

              <Pressable
                style={[styles.sendBtn, { backgroundColor: theme.primary }, (!query.trim() || isTyping) && styles.sendBtnDisabled]}
                onPress={() => sendMessage(query)}
                disabled={!query.trim() || isTyping}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="arrow-upward" size={20} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
            <Text style={[styles.disclaimer, { color: theme.textDim }]}>
              AI-generated guidance can be wrong. Confirm important decisions.
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 4,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
  },
  scrollContentIntro: {
    flexGrow: 1,
  },

  intro: {
    flex: 1,
    gap: 18,
    paddingBottom: 10,
  },
  botCard: {
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 16,
    marginTop: 2,
  },
  botTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botCopy: {
    flex: 1,
  },
  botName: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  botTagline: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },
  botIntro: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  quickWrap: {
    gap: 10,
  },
  quickGrid: {
    gap: 10,
  },
  quickCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickCardText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
  },

  bubbleList: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  inChatBotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginLeft: 2,
  },
  inChatBotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inChatBotLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  
  typingBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    marginLeft: 38,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  inlineQuick: {
    gap: 8,
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 38,
  },
  quickChipSmall: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  quickChipSmallText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },

  errorBubble: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },

  inputWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 22 : 14,
    borderTopWidth: 1,
  },
  composerRow: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    gap: 8,
  },
  newChatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 96,
    paddingVertical: 10,
    paddingRight: 4,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  disclaimer: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});