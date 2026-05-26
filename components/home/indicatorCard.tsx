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
}: {
    icon: string;
    label: string;
    value: string;
    trend: string;
    trendLabel: string;
    positive?: boolean;
    onPress?: () => void;
    cycleData?: CycleEntry[];
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
    const current = hasCycle ? cycleData![activeIndex] : { label, value, trend, trendLabel, positive };

    const content = (
        <>
            <View style={styles.indicatorHeader}>
                <Text style={styles.indicatorIcon}>{icon}</Text>
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
                        backgroundColor: current.positive ? theme.primaryDim : theme.dangerDim,
                        opacity: hasCycle ? fadeAnim : 1,
                    },
                ]}
            >
                <Text style={[styles.trendText, { color: current.positive ? theme.primary : theme.danger }]}>
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
                <Card style={styles.indicatorCardInner}>
                    {content}
                </Card>
            </TouchableOpacity>
        );
    }

    return (
        <Card style={styles.indicatorCard}>
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
    },
    indicatorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    indicatorIcon: {
        fontSize: 14,
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