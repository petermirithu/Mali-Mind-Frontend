import { Fonts } from "@/constants/fonts";
import { ThemeColors } from "@/constants/theme";
import { Pressable, Text, View } from "@gluestack-ui/themed";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

export default function ButtonRound({ theme, title, loadingText, canSubmit, isSubmitting, onPress }: { theme: ThemeColors, title: string, loadingText: string, canSubmit: boolean, isSubmitting: boolean, onPress: () => void }) {
    const sc = useMemo(() => makeStyles(theme), [theme]);
    return (
        <Pressable
            style={[sc.btn, (!canSubmit || isSubmitting) && sc.btnDisabled]}
            onPress={onPress}
            disabled={!canSubmit || isSubmitting}
        >
            {isSubmitting ? (
                <View display="flex" flexDirection="row" alignItems="center" justifyContent="center" gap="10">
                    <ActivityIndicator color={theme.onPrimary} />
                    <Text style={sc.text}>{loadingText}</Text>
                </View>
            ) : (
                <Text style={sc.text}>{title}</Text>
            )}
        </Pressable>
    );
}

const makeStyles = (theme: ThemeColors) =>
    StyleSheet.create({
        btn: {
            height: 50,
            borderRadius: 999,
            backgroundColor: theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 14,
            elevation: 8,
            marginBottom: 14,
        },
        btnDisabled: {
            backgroundColor: theme.disabledSurface,
            shadowOpacity: 0.12,
            elevation: 2,
        },
        text: {
            fontFamily: Fonts.sans,
            color: theme.onPrimary,
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: 0.2,
        },
    });