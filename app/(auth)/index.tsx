import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@gluestack-ui/themed';
import { useAssets } from 'expo-asset';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { router } from 'expo-router';

import { Fonts } from '@/constants/fonts';
import { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

function MaliLogo({
  opacity,
  scale,
  theme,
}: {
  opacity: Animated.Value;
  scale: Animated.Value;
  theme: ThemeColors;
}) {
  const sc = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Animated.View style={[sc.logoWrap, { opacity, transform: [{ scale }] }]}>
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

export default function GetStartedScreen() {
  const { theme } = useTheme();
  const sc = useMemo(() => makeStyles(theme), [theme]);

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

  const [assets] = useAssets([require('../../assets/backgrounds/earth_down_kenya.png')]);

  const handlePressIn = () => {
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(chartOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(chartScaleY, { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOp, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(taglineY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(btnY, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [bgOpacity, heroOpacity, chartOpacity, chartScaleY, logoOpacity, logoScale, taglineOp, taglineY, btnOpacity, btnY]);

  if (!assets) {
    return (
      <SafeAreaView style={sc.screen} edges={['top', 'bottom']}>
        <View style={sc.loadingWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground source={{ uri: assets[0].localUri ?? assets[0].uri }} style={sc.bgImage} resizeMode="cover">
      <SafeAreaView style={sc.screen} edges={['top', 'bottom']}>
        <View style={sc.bottomContent}>
          <MaliLogo opacity={logoOpacity} scale={logoScale} theme={theme} />

          <Animated.View style={[sc.taglineWrap, { opacity: taglineOp, transform: [{ translateY: taglineY }] }]}>
            <Text style={sc.tagline1}>Understand today.</Text>
            <Text style={sc.tagline2}>Plan for tomorrow.</Text>
          </Animated.View>

          <Animated.View style={[sc.btnWrap, { opacity: btnOpacity, transform: [{ translateY: btnY }, { scale: btnScale }] }]}>
            <TouchableOpacity
              style={sc.btn}
              activeOpacity={1}
              onPress={()=> router.push("/(auth)/sign-in")}              
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
                <Defs>
                  <RadialGradient id="btnGlow" cx="50%" cy="0%" r="80%">
                    <Stop offset="0%" stopColor={theme.onPrimary} stopOpacity="0.18" />
                    <Stop offset="100%" stopColor={theme.onPrimary} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect width="100%" height="100%" rx={16} fill="url(#btnGlow)" />
              </Svg>
              <Text style={sc.btnText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={sc.footer}>
            Your economic companion.{'\n'}Built for Kenya.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: 'transparent',
      alignItems: 'center',
    },

    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    bgImage: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.background,      
    },

    bottomContent: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 28,
      paddingBottom: 28,
      gap: 0,
    },

    logoWrap: {
      marginBottom: 25,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    logoText: {
      fontFamily: Fonts.sans,
      fontSize: 64,
      fontWeight: '900',
      color: theme.primary,
      letterSpacing: -1,
      lineHeight: 70,
      textShadowColor: theme.greenGlow,
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
      borderRadius: 6,
      backgroundColor: theme.warning,
      shadowColor: theme.warning,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 8,
      elevation: 6,
    },

    taglineWrap: {
      alignItems: 'center',
      marginBottom: 130,
    },
    tagline1: {
      fontFamily: Fonts.sans,
      fontSize: 22,
      fontWeight: '300',
      color: theme.text,
      letterSpacing: 0.3,
      lineHeight: 30,
    },
    tagline2: {
      fontFamily: Fonts.sans,
      fontSize: 22,
      fontWeight: '700',
      color: theme.primary,
      letterSpacing: 0.3,
      lineHeight: 30,
      textShadowColor: theme.greenGlow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 12,
    },

    btnWrap: {
      width: '100%',
      marginBottom: 20,
    },
    btn: {
      width: '100%',
      height: 58,
      borderRadius: 100,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.55,
      shadowRadius: 20,
      elevation: 10,
    },
    btnText: {
      fontFamily: Fonts.sans,
      fontSize: 18,
      fontWeight: '700',
      color: theme.onPrimary,
      letterSpacing: 0.4,
    },

    footer: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: theme.textDim,
      textAlign: 'center',
      lineHeight: 21,
    },
  });