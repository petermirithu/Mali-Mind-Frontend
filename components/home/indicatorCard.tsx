import { useTheme } from "@/contexts/theme-context";
import { Text, View } from "@gluestack-ui/themed";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import Card from "./card";

export type CycleEntry = {
    label: string;
    value: string;
    trend: string;
    trendLabel: string;
    positive: boolean;
    color: string;
};

export default function IndicatorCard({
    icon,
    label,
    value,
    trend,
    trendLabel,
    positive = false,
    onPress,
    cycleData,
    color
}: {
    icon: string;
    label: string;
    value: string;
    trend: string;
    trendLabel: string;
    positive?: boolean;
    onPress?: () => void;
    cycleData?: CycleEntry[];
    color?: string;
}) {
    const { theme } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const hasCycle = cycleData && cycleData.length > 1;

    useEffect(() => {
        if (!hasCycle) return;

        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                // Switch to next entry
                setActiveIndex((prev) => (prev + 1) % cycleData!.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [hasCycle, cycleData?.length]);

    // Resolve current display values
    const current = hasCycle ? cycleData![activeIndex] : { label, value, trend, trendLabel, positive, color };

    const content = (
        <>
            <View style={styles.indicatorHeader}>
                <View style={[styles.iconBox, { backgroundColor: `${current?.color || color}18` }]}>
                    <Text style={styles.indicatorIcon}>{icon}</Text>
                </View>
                <Animated.Text
                    style={[
                        styles.indicatorLabel,
                        { color: theme.textDim, opacity: hasCycle ? fadeAnim : 1 },
                    ]}
                >
                    {current.label}
                </Animated.Text>
            </View>
            <Animated.Text
                style={[
                    styles.indicatorValue,
                    { color: theme.text, opacity: hasCycle ? fadeAnim : 1 },
                ]}
            >
                {current.value}
            </Animated.Text>
            <Animated.View
                style={[
                    styles.trendPill,
                    {
                        backgroundColor: `${current.color}30`,
                        opacity: hasCycle ? fadeAnim : 1,
                    },
                ]}
            >
                <Text style={[styles.trendText, { color: current.color }]}>
                    {current.trend} {current.trendLabel}
                </Text>
            </Animated.View>
            <View style={styles.cardFooter}>
                {hasCycle ? (
                    <View style={styles.cycleDots}>
                        {cycleData!.map((_, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.cycleDot,
                                    {
                                        backgroundColor: theme.primary,
                                        opacity: idx === activeIndex ? 1 : 0.25,
                                        width: idx === activeIndex ? 12 : 5,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.cycleDots} />
                )}
                {onPress ? (
                    <Text style={{ fontSize: 10, color: theme.textDim, marginTop: 4, fontWeight: '500' }}>
                        Tap to view details
                    </Text>
                ) : (
                    <Text style={{ fontSize: 10, marginTop: 4, opacity: 0 }}>·</Text>
                )}
            </View>
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.indicatorCardWrapper}>
                <Card style={[styles.indicatorCardInner,
                {
                    borderWidth: 1,
                    borderColor: `${current?.color || color || theme.cardBorder}30`,
                }
                ]}>
                    {content}
                </Card>
            </TouchableOpacity>
        );
    }

    return (
        <Card style={[styles.indicatorCard, { borderColor: `${current?.color || color}30` }]} >
            {content}
        </Card>
    );
}

const CARD_MIN_HEIGHT = 150;

const styles = StyleSheet.create({
    indicatorCardWrapper: {
        flex: 1,
        marginBottom: 12,
    },
    indicatorCardInner: {
        flex: 1,
        minHeight: CARD_MIN_HEIGHT,
        marginBottom: 0,
        padding: 14,
    },
    indicatorCard: {
        flex: 1,
        minHeight: CARD_MIN_HEIGHT,
        marginBottom: 12,
        padding: 14,
        borderWidth: 1,
    },
    indicatorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    iconBox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorIcon: {
        fontSize: 13,
    },
    indicatorLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    indicatorValue: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    trendPill: {
        alignSelf: 'flex-start',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardFooter: {
        marginTop: 'auto' as any,
        paddingTop: 6,
    },
    cycleDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minHeight: 5,
    },
    cycleDot: {
        height: 5,
        borderRadius: 3,
    },
});