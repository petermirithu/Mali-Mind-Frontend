import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Image,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@gluestack-ui/themed';
import { useAssets } from 'expo-asset';
import Svg, {
    Defs,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import { router } from 'expo-router';

const { width: W, height: H } = Dimensions.get('window');

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    bg: '#08101A',
    green: '#0B8F4D',
    greenBright: '#12C068',
    greenGlow: 'rgba(11,143,77,0.55)',
    greenDim: 'rgba(11,143,77,0.18)',
    gold: '#F5B301',
    text: '#FFFFFF',
    textSub: '#8A9BB5',
    textDim: '#3A4D63',
    btnText: '#FFFFFF',
};

// ─── MALI Logo ────────────────────────────────────────────────────────────────
function MaliLogo({ opacity, scale }: { opacity: Animated.Value; scale: Animated.Value }) {
    return (
        <Animated.View style={[sc.logoWrap, { opacity, transform: [{ scale }] }]}>
            {/* MALI text — M A L rendered normally, I rendered with gold dot */}
            <View style={sc.logoRow}>
                <Text style={sc.logoText}>MAL</Text>
                <View style={sc.logoIWrap}>
                    <Text style={sc.logoText}>i</Text>
                    <View style={sc.logoGoldDot} />
                </View>
            </View>
        </Animated.View>
    );
}

// ─── Get Started Screen ────────────────────────────────────────────────────────────
export default function GetStartedScreen() {
    // Animated values
    const bgOpacity = useRef(new Animated.Value(0)).current;
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const chartOpacity = useRef(new Animated.Value(0)).current;
    const chartScaleY = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const taglineOp = useRef(new Animated.Value(0)).current;
    const taglineY = useRef(new Animated.Value(16)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;
    const btnY = useRef(new Animated.Value(24)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    const [assets] = useAssets([
        require('../../assets/backgrounds/earth_down_kenya.png'),
    ]);

    const handlePressIn = () => {
        Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, tension: 180, friction: 12 }).start();
    };
    const handlePressOut = () => {
        Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start();
    };

    useEffect(() => {
        Animated.sequence([
            // 1. Background glow fades in
            Animated.timing(bgOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
            // 2. Map appears
            // 2. Hero image appears
            Animated.timing(heroOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            // 3. Bar chart rises
            Animated.parallel([
                Animated.timing(chartOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(chartScaleY, { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }),
            ]),
            // 4. Logo pops in
            Animated.parallel([
                Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(logoScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
            ]),
            // 5. Tagline slides up
            Animated.parallel([
                Animated.timing(taglineOp, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.spring(taglineY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
            ]),
            // 6. Button rises
            Animated.parallel([
                Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(btnY, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    if (!assets) {
        return (
            <SafeAreaView style={sc.screen} edges={['top', 'bottom']}>
                <View style={sc.loadingWrap}>
                    <ActivityIndicator size="large" color={C.green} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <ImageBackground
            source={{ uri: assets[0].localUri ?? assets[0].uri }}
            style={sc.bgImage}
            resizeMode="contain"
        >
            <SafeAreaView style={sc.screen} edges={['top', 'bottom']}>
                {/* ── Bottom content ────────────────────────────────────────────────── */}
                <View style={sc.bottomContent}>
                    {/* MALI logo */}
                    <MaliLogo opacity={logoOpacity} scale={logoScale} />

                    {/* Tagline */}
                    <Animated.View style={[sc.taglineWrap, { opacity: taglineOp, transform: [{ translateY: taglineY }] }]}>
                        <Text style={sc.tagline1}>Understand today.</Text>
                        <Text style={sc.tagline2}>Plan for tomorrow.</Text>
                    </Animated.View>

                    {/* CTA Button */}
                    <Animated.View style={[sc.btnWrap, { opacity: btnOpacity, transform: [{ translateY: btnY }, { scale: btnScale }] }]}>
                        <TouchableOpacity
                            style={sc.btn}
                            activeOpacity={1}
                            onPress={() => {
                                router.push('/(tabs)')
                            }}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                        >
                            {/* Inner glow on button */}
                            <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
                                <Defs>
                                    <RadialGradient id="btnGlow" cx="50%" cy="0%" r="80%">
                                        <Stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
                                        <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
                                    </RadialGradient>
                                </Defs>
                                <Rect width="100%" height="100%" rx={16} fill="url(#btnGlow)" />
                            </Svg>
                            <Text style={sc.btnText}>Get Started</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Footer */}
                    <Text style={sc.footer}>Your economic companion.{'\n'}Built for Kenya.</Text>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
    },

    // Loading
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    bgImage: {
        flex: 1,
        width: '100%',
        backgroundColor: C.bg,
    },

    // Bottom content
    bottomContent: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 28,
        paddingBottom: 28,
        gap: 0,
    },

    // Logo
    logoWrap: {
        marginBottom: 25,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    logoText: {
        fontSize: 64,
        fontWeight: '900',
        color: C.green,
        letterSpacing: -1,
        lineHeight: 70,
        textShadowColor: C.greenGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 24,
    },
    logoIWrap: {
        position: 'relative',
    },
    logoGoldDot: {
        position: 'absolute',
        top: 5,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 5,
        backgroundColor: C.gold,
        shadowColor: C.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 6,
    },

    // Tagline
    taglineWrap: {
        alignItems: 'center',
        marginBottom: 130,
    },
    tagline1: {
        fontSize: 22,
        fontWeight: '300',
        color: C.text,
        letterSpacing: 0.3,
        lineHeight: 30,
    },
    tagline2: {
        fontSize: 22,
        fontWeight: '700',
        color: C.green,
        letterSpacing: 0.3,
        lineHeight: 30,
        textShadowColor: C.greenGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },

    // CTA
    btnWrap: {
        width: '100%',
        marginBottom: 20,
    },
    btn: {
        width: '100%',
        height: 58,
        borderRadius: 16,
        backgroundColor: C.green,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: C.green,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55,
        shadowRadius: 20,
        elevation: 10,
    },
    btnText: {
        fontSize: 18,
        fontWeight: '700',
        color: C.btnText,
        letterSpacing: 0.4,
    },

    // Footer
    footer: {
        fontSize: 13,
        color: C.textDim,
        textAlign: 'center',
        lineHeight: 21,
    },
});