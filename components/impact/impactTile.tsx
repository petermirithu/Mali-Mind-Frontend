import { Text, View } from "@gluestack-ui/themed";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

const getTileColor = (category: string, theme: any) => {
    const TILE_COLORS: Record<string, string> = {
        'Transport': theme.success,
        'Food & Groceries': theme.warning,
        'Utilities': theme.danger,
        'Other': theme.accent,
    };
    return TILE_COLORS[category] ?? theme.accent;
};

export default function ImpactTile({
    icon,
    label,
    amount,
    pct,
    direction,
    theme,
}: {
    icon: string;
    label: string;
    amount: string;
    pct: string;
    direction: 'up' | 'down' | 'stable';
    theme: any;
}) {
    const it = useMemo(() => create_it(theme), [theme]);
    const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
    const color = getTileColor(label, theme);

    return (
        <View style={[it.tile, { borderColor: `${color}30` }]}>
            <View style={it.top}>
                <View style={[it.iconBox, { backgroundColor: `${color}18` }]}>
                    <Text style={it.icon}>{icon}</Text>
                </View>
                <Text style={it.label}>{label}</Text>
            </View>
            <Text style={[it.amount, { color }]}>{amount}</Text>
            <View style={it.pctRow}>
                <Text style={[it.arrow, { color }]}>{arrow}</Text>
                <Text style={[it.pct, { color }]}>{pct}</Text>
            </View>
        </View>
    );
}

const create_it = (theme: any) => StyleSheet.create({
    tile: {
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        minHeight: 130,
    },
    top: {
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
    icon: {
        fontSize: 13,
    },
    label: {
        fontSize: 11,
        color: theme.textDim,
        fontWeight: '500',
        flex: 1,
    },
    amount: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    pctRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginBottom: 8,
    },
    arrow: {
        fontSize: 11,
        fontWeight: '700',
    },
    pct: {
        fontSize: 11,
        fontWeight: '700',
    },
    spark: {
        marginTop: 'auto' as any,
    },
});
