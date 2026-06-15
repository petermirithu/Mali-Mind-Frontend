import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/contexts/theme-context";
import { FeedItemUi } from "@/hooks/use-feed";
import { Text, View } from "@gluestack-ui/themed";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function FeedCard({ item, cfg, toTitleLabel }: { item: FeedItemUi, cfg: any , toTitleLabel: Function}) {
    const [expanded, setExpanded] = useState(false);
    const { theme } = useTheme();
    const fc = useMemo(() => createFeedCardStyles(theme), [theme]);

    const tone = (() => {
        if (cfg.tone === 'danger') {
            return {
                color: theme.danger,
                bg: theme.dangerDim,
            };
        }
        if (cfg.tone === 'warning') {
            return {
                color: theme.warning,
                bg: theme.warningDim ?? 'rgba(251,191,36,0.14)',
            };
        }
        if (cfg.tone === 'success') {
            return {
                color: theme.success,
                bg: theme.primaryDim,
            };
        }
        return {
            color: theme.accent,
            bg: theme.accentDim ?? 'rgba(56,189,248,0.14)',
        };
    })();

    const handleExpand = useCallback(() => {
        setExpanded((e) => !e);
    }, []);

    return (
        <View
            style={[
                fc.card,
                {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                    shadowColor: theme.shadow,
                },
            ]}
        >
            <View style={fc.topRow}>
                <View style={[fc.catChip, { backgroundColor: tone.bg }]}>
                    <Text style={fc.catIcon}>{cfg.icon}</Text>
                    <Text style={[fc.catLabel, { color: tone.color }]}>{toTitleLabel(item.category)}</Text>
                </View>

                <View style={fc.topRight}>
                    <Text style={[fc.time, { color: theme.textDim }]}>{item.time}</Text>
                </View>
            </View>

            <Text style={[fc.title, { color: theme.text }]}>{item.title}</Text>

            {!expanded && (
                <Text style={[fc.preview, { color: theme.textDim }]} numberOfLines={2}>
                    {item.what}
                </Text>
            )}

            {expanded && (
                <View style={fc.expandedBody}>
                    <View style={fc.section}>
                        <Text style={[fc.sectionLabel, { color: theme.textDim }]}>WHAT HAPPENED</Text>
                        <Text style={[fc.sectionText, { color: theme.text }]}>{item.what}</Text>
                    </View>

                    <View style={[fc.divider, { backgroundColor: theme.cardBorder }]} />

                    <View style={fc.section}>
                        <Text style={[fc.sectionLabel, { color: theme.textDim }]}>WHY IT HAPPENED</Text>
                        <Text style={[fc.sectionText, { color: theme.text }]}>{item.why}</Text>
                    </View>

                    <View style={[fc.divider, { backgroundColor: theme.cardBorder }]} />

                    <View
                        style={[
                            fc.maliBox,
                            {
                                backgroundColor: theme.primaryDim,
                                borderColor: theme.feedInsightBorder ?? 'rgba(11,143,77,0.30)',
                            },
                        ]}
                    >
                        <View style={fc.maliHeader}>
                            <View style={[fc.maliIconWrap, { backgroundColor: theme.feedInsightGlow ?? 'rgba(11,143,77,0.22)' }]}>
                                <Text style={[fc.maliIcon, { color: theme.primary }]}>M</Text>
                            </View>
                            <Text style={[fc.maliTitle, { color: theme.primary }]}>Mali Insight</Text>
                        </View>
                        <Text style={[fc.maliText, { color: theme.text }]}>{item.impact}</Text>
                    </View>
                </View>
            )}

            {item.sourceUrl ? (
                <Text style={[fc.sourceText, { color: theme.textDim }]}>Source: {item.sourceUrl}</Text>
            ) : null}

            <TouchableOpacity style={fc.expandBtn} onPress={handleExpand} activeOpacity={0.72}>
                <Text style={[fc.expandBtnText, { color: theme.primary }]}>
                    {expanded ? 'Show less' : 'Read full analysis'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const createFeedCardStyles = (theme: any) =>
    StyleSheet.create({
        card: {
            borderRadius: 20,
            borderWidth: 1,
            padding: 18,
            marginBottom: 14,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22,
            shadowRadius: 18,
            elevation: 4,
        },
        topRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        catChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderRadius: 999,
            paddingHorizontal: 11,
            paddingVertical: 6,
        },
        catIcon: { fontSize: 12 },
        catLabel: {
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            fontFamily: Fonts.sans,
        },
        topRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        time: {
            fontSize: 11,
            fontFamily: Fonts.mono,
        },
        title: {
            fontSize: 17,
            fontWeight: '700',
            lineHeight: 24,
            marginBottom: 10,
            letterSpacing: 0.1,
            fontFamily: Fonts.sans,
        },
        preview: {
            fontSize: 14,
            lineHeight: 21,
            marginBottom: 12,
            fontFamily: Fonts.sans,
        },
        expandedBody: {
            marginBottom: 12,
        },
        section: {
            paddingVertical: 12,
        },
        sectionLabel: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.2,
            marginBottom: 6,
            fontFamily: Fonts.rounded,
        },
        sectionText: {
            fontSize: 14,
            lineHeight: 22,
            fontFamily: Fonts.sans,
        },
        divider: {
            height: 1,
        },
        maliBox: {
            marginTop: 14,
            borderWidth: 1,
            borderRadius: 14,
            padding: 14,
        },
        maliHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
        },
        maliIconWrap: {
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
        },
        maliIcon: { fontSize: 10, fontWeight: '700', fontFamily: Fonts.rounded },
        maliTitle: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.3,
            fontFamily: Fonts.rounded,
        },
        maliText: { fontSize: 14, lineHeight: 22, fontFamily: Fonts.sans },
        sourceText: {
            fontSize: 11,
            marginBottom: 8,
            fontFamily: Fonts.mono,
        },
        expandBtn: {
            paddingTop: 4,
        },
        expandBtnText: {
            fontSize: 13,
            fontWeight: '600',
            fontFamily: Fonts.rounded,
        },
    });