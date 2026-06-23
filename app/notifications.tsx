import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/theme-context';
import { Fonts } from '@/constants/fonts';
import { Text, View } from '@gluestack-ui/themed';

type NotificationItem = {
    id: string;
    title: string;
    body: string;
    time: string;
    type: 'alert' | 'update' | 'insight';
    read: boolean;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    // {
    //     id: 'n1',
    //     title: 'Fuel prices updated',
    //     body: 'Petrol and diesel prices were adjusted this morning. Tap to review the latest market impact.',
    //     time: '12m ago',
    //     type: 'update',
    //     read: false,
    // },
    // {
    //     id: 'n2',
    //     title: 'Food basket pressure rising',
    //     body: 'Weekly basket moved up 1.8%. Mali has prepared a quick summary on key drivers.',
    //     time: '1h ago',
    //     type: 'alert',
    //     read: false,
    // },
    // {
    //     id: 'n3',
    //     title: 'New Mali insight available',
    //     body: 'You have a fresh explainer for inflation trends and what they mean for household spending.',
    //     time: 'Yesterday',
    //     type: 'insight',
    //     read: true,
    // },
];

export default function Notifications() {
    const { theme } = useTheme();
    const router = useRouter();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

    const unreadCount = items.filter((n) => !n.read).length;

    const onOpenNotification = (id: string) => {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const badgeTone = (type: NotificationItem['type']) => {
        if (type === 'alert') return { bg: theme.dangerDim, color: theme.danger, label: 'Alert' };
        if (type === 'insight') return { bg: theme.primaryDim, color: theme.primary, label: 'Insight' };
        return { bg: theme.primaryDim, color: theme.accent, label: 'Update' };
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top'] as any}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}
                    activeOpacity={0.75}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-back" size={22} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.headerCopy}>
                    <Text style={[styles.sectionLabel, { color: theme.textDim }]}>UPDATES</Text>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
                </View>

                <View style={[styles.unreadPill, { backgroundColor: theme.subtleSurface, borderColor: theme.subtleBorder }]}> 
                    <Text style={[styles.unreadPillText, { color: theme.primary }]}>{unreadCount} unread</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {items?.length > 0 ?
                    <>
                        {
                            items.map((item) => {
                                const tone = badgeTone(item.type);
                                return (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => onOpenNotification(item.id)}
                                        style={[
                                            styles.card,
                                            {
                                                backgroundColor: theme.glassSurface,
                                                borderColor: item.read ? theme.glassBorder : theme.primary,
                                            },
                                        ]}
                                    >
                                        <View style={styles.cardTopRow}>
                                            <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                                                <Text style={[styles.badgeText, { color: tone.color }]}>{tone.label}</Text>
                                            </View>
                                            <Text style={[styles.time, { color: theme.textDim }]}>{item.time}</Text>
                                        </View>

                                        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                                        <Text style={[styles.cardBody, { color: theme.textDim }]}>{item.body}</Text>

                                        {!item.read ? <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} /> : null}
                                    </Pressable>
                                );
                            })
                        }
                        <Text style={[styles.footer, { color: theme.textDim }]}>You are all caught up</Text>
                    </>
                    :
                    <View
                        style={[
                            styles.emptyWrap,
                            {
                                backgroundColor: theme.glassSurface,
                                borderColor: theme.glassBorder,
                            },
                        ]}
                    >
                        <View style={[styles.emptyIconWrap, { backgroundColor: theme.primaryDim }]}>
                            <MaterialIcons name="notifications-none" size={24} color={theme.primary} />
                        </View>

                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No notifications yet</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textDim }]}>
                            New alerts and Mali insights will show up here as soon as they are available.
                        </Text>

                        <View style={[styles.emptyPill, { backgroundColor: theme.primaryDim }]}>
                            <Text style={[styles.emptyPillText, { color: theme.primary }]}>You are all caught up</Text>
                        </View>
                    </View>
                }
            </ScrollView>
        </SafeAreaView >
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        screen: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
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
        unreadPill: {
            borderWidth: 1,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        unreadPillText: {
            fontFamily: Fonts.rounded,
            fontSize: 12,
            fontWeight: '700',
        },
        scroll: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingTop: 6,
            paddingBottom: 26,
            gap: 12,
        },
        card: {
            borderWidth: 1,
            borderRadius: 18,
            padding: 14,
            position: 'relative',
        },
        cardTopRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        badge: {
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
        },
        badgeText: {
            fontFamily: Fonts.rounded,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
        },
        time: {
            fontFamily: Fonts.mono,
            fontSize: 11,
        },
        cardTitle: {
            fontFamily: Fonts.sans,
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 6,
            lineHeight: 22,
        },
        cardBody: {
            fontFamily: Fonts.sans,
            fontSize: 13.5,
            lineHeight: 20,
            paddingRight: 10,
        },
        unreadDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            position: 'absolute',
            right: 12,
            bottom: 12,
        },
        footer: {
            fontFamily: Fonts.sans,
            textAlign: 'center',
            fontSize: 12,
            marginTop: 8,
        },

        emptyWrap: {
            borderWidth: 1,
            borderRadius: 20,
            paddingVertical: 28,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
        },
        emptyIconWrap: {
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
        },
        emptyTitle: {
            fontFamily: Fonts.sans,
            fontSize: 17,
            fontWeight: '700',
            marginBottom: 6,
        },
        emptySubtitle: {
            fontFamily: Fonts.sans,
            fontSize: 13.5,
            lineHeight: 20,
            textAlign: 'center',
            maxWidth: 280,
            marginBottom: 14,
        },
        emptyPill: {
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7,
        },
        emptyPillText: {
            fontFamily: Fonts.rounded,
            fontSize: 12,
            fontWeight: '700',
        },
    });