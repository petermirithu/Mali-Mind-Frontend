import { Fonts } from "@/constants/fonts";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function SocialButton({
    label,
    icon,
    onPress,
    disabled = false,
}: {
    label: string;
    icon: 'logo-google';
    onPress: () => void;
    disabled?: boolean;
}) {
    const { theme } = useTheme();
    const sc = useMemo(() => makeStyles(theme), [theme]);

    return (
        <Pressable style={[sc.socialBtn, disabled && sc.socialBtnDisabled]} onPress={onPress} disabled={disabled}>
            <Ionicons name={icon} size={18} color={theme.text} />
            <Text style={sc.socialText}>{label}</Text>
        </Pressable>
    );
}

const makeStyles = (theme: ThemeColors) =>
    StyleSheet.create({
        socialBtn: {
            flex: 1,
            height: 44,
            borderRadius: 11,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },
        socialText: {
            fontFamily: Fonts.sans,
            color: theme.text,
            fontSize: 14,
            fontWeight: '600',
        },
        socialBtnDisabled: {
            opacity: 0.6,
        },
    });