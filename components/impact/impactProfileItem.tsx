import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@gluestack-ui/themed";
import { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function ImpactProfileItem({
    icon,
    label,
    value,
    valueColor,
    isViewAll,
    onPress,
    theme,
}: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
    isViewAll?: boolean;
    onPress?: () => void;
    theme: any;
}) {
    const p = useMemo(() => create_p(theme), [theme]);
    const content = (
        <>
            <View style={p.iconBox}>
                {isViewAll ? (
                    <FontAwesome
                        name={label === 'Show less' ? "chevron-up" : "chevron-down"}
                        size={15}
                        color="white"
                    />
                ) : (
                    <Text style={p.emoji}>{icon}</Text>
                )}
            </View>
            <Text style={p.itemLabel}>{label}</Text>
            <Text style={[p.itemValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity style={p.item} onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return <View style={p.item}>{content}</View>;
}

const create_p = (theme: any) => StyleSheet.create({
    item: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1A2535',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: theme.cardBorder,
    },
    emoji: {
        fontSize: 18,
    },
    arrowIcon: {
        fontSize: 22,
        color: theme.textDim,
        fontWeight: '300',
    },
    itemLabel: {
        fontSize: 10,
        color: theme.textDim,
        textAlign: 'center',
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    itemValue: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.text,
        textAlign: 'center',
    },
});