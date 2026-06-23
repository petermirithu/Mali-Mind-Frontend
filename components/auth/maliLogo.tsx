import { Fonts } from "@/constants/fonts";
import { ThemeColors } from "@/constants/theme";
import { Text, View } from "@gluestack-ui/themed";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export default function MaliLogo({ theme, title, subTitle }: { theme: ThemeColors, title: string, subTitle: string }) {
    const sc = useMemo(() => makeStyles(theme), [theme]);
    return (
        <View style={sc.logoWrap}>
            <View style={sc.logoRow}>
                <Text style={sc.logoText}>MAL</Text>
                <View style={sc.logoIWrap}>
                    <Text style={sc.logoText}>i</Text>
                    <View style={sc.logoGoldDot} />
                </View>
            </View>
            <Text style={sc.logoSub}>{title}</Text>
            <Text style={sc.logoHint}>{subTitle}</Text>
        </View>
    );
}

const makeStyles = (theme: ThemeColors) =>
    StyleSheet.create({
        logoWrap: {
            alignItems: 'center',
            marginBottom: 20,
        },
        logoRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        logoText: {
            fontFamily: Fonts.sans,
            fontSize: 56,
            fontWeight: '900',
            color: theme.primary,
            letterSpacing: -1.2,
            lineHeight: 60,
            textShadowColor: theme.greenGlow,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 18,
        },
        logoIWrap: {
            position: 'relative',
        },
        logoGoldDot: {
            position: 'absolute',
            top: 3,
            right: 1,
            width: 12,
            height: 12,
            borderRadius: 100,
            backgroundColor: theme.warning,
            shadowColor: theme.warning,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 7,
            elevation: 4,
        },
        logoSub: {
            marginTop: 4,
            fontFamily: Fonts.sans,
            fontSize: 22,
            fontWeight: '700',
            color: theme.text,
            letterSpacing: 0.2,
        },
        logoHint: {
            marginTop: 6,
            fontFamily: Fonts.sans,
            fontSize: 13,
            color: theme.textDim,
            textAlign: 'center',
        },
    });