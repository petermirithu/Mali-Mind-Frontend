import { Text, View } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import Markdown from 'react-native-markdown-display';
import { Fonts } from '@/constants/fonts';
import { useTheme } from '@/contexts/theme-context';

type Role = 'user' | 'assistant';
type ChatMessage = { role: Role; text: string; id: string };

export default function Bubble({
    msg,
    primary,
    text,
    textDim,
    card,
    cardBorder,
}: {
    msg: ChatMessage;
    primary: string;
    text: string;
    textDim: string;
    card: string;
    cardBorder: string;
}) {
    const isUser = msg.role === 'user';
    const { theme } = useTheme();

    return (
        <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
            {!isUser && (
                <View style={[styles.avatar, { backgroundColor: theme.primaryDim, borderColor: primary }]}>
                    <Text style={[styles.avatarText, { color: primary }]}>✦</Text>
                </View>
            )}
            <View
                style={[
                    styles.bubble,
                    isUser
                        ? [styles.bubbleUser, { backgroundColor: primary }]
                        : [styles.bubbleAssistant, { backgroundColor: card, borderColor: cardBorder }],
                ]}
            >
                <Markdown
                    style={{
                        body: {
                            ...styles.bubbleText,
                            color: text,
                            marginTop: 0,
                            marginBottom: 0,
                        },
                        paragraph: {
                            marginTop: 0,
                            marginBottom: 8,
                            color: text,
                        },
                        bullet_list: {
                            marginTop: 0,
                            marginBottom: 8,
                        },
                        ordered_list: {
                            marginTop: 0,
                            marginBottom: 8,
                        },
                        list_item: {
                            color: text,
                        },
                        strong: {
                            color: text,
                            fontWeight: '700',
                        },
                        em: {
                            color: text,
                            fontStyle: 'italic',
                        },
                        code_inline: {
                            color: text,
                            backgroundColor: theme.surface,
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            borderRadius: 4,
                        },
                        code_block: {
                            color: text,
                            backgroundColor: theme.surface,
                            padding: 10,
                            borderRadius: 8,
                        },
                    }}
                >
                    {msg.text}
                </Markdown>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
    },
    rowAssistant: {
        alignSelf: 'flex-start',
        maxWidth: '88%',
    },
    rowUser: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
        maxWidth: '84%',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    avatarText: {
        fontSize: 13,
    },
    bubble: {
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bubbleAssistant: {
        borderWidth: 1,
        borderBottomLeftRadius: 4,
    },
    bubbleUser: {
        borderBottomRightRadius: 4,
    },
    bubbleText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 21,
    },
    bubbleMeta: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
    },
});