import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import { Text, View } from '@gluestack-ui/themed';
import { Fonts } from '../../constants/fonts';
import type { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/theme-context';
import { loginWithEmail, loginWithGoogleNative } from '../../authentication/firebase-auth';
import { resolveToastAction, showAppToast, useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import * as WebBrowser from 'expo-web-browser';
import SocialButton from '@/components/auth/socialButton';
import MaliLogo from '@/components/auth/maliLogo';
import FormInput from '@/components/auth/formInput';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { theme } = useTheme();
  const sc = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();
  const toast = useToast();

  const [assets] = useAssets([require('../../assets/backgrounds/earth_up.png')]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  
  const { getMe, socialAuth } = useAuth();
  const { mutateAsync: emailFetchProfile } = getMe;
  const { mutateAsync: socialFetchProfile } = socialAuth;

  const canSubmit = email.trim().includes('@') && password.trim().length >= 8;

  const onSignIn = async () => {    
    if (!canSubmit || isSigningIn) return;

    setIsSigningIn(true);
    try {
      const token = await loginWithEmail(email.trim(), password);
      await emailFetchProfile({ token: token, email: email });
      setIsSigningIn(false);      
      router.replace('/(tabs)');
    }
    catch (error: any) {
      const rawMessage =
        error?.message ??
        error?.response?.data?.message ??
        'Unable to sign in. Please try again.';
      const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
      
      showAppToast(toast, {
        action: resolveToastAction('error'),
        title: 'Sign in failed',
        description: message,
        duration: 3500,
      });
    }
    finally {
      setIsSigningIn(false);
    }
  };

  const onGoogleSignIn = async () => {
    if (isGoogleSigningIn) return;

    setIsGoogleSigningIn(true);
    try {
      const result = await loginWithGoogleNative();            
      await socialFetchProfile(result);      
      router.replace('/(tabs)');
    } 
    catch (error: any) {
      console.log("Sign error...")
      console.log(error)

      
      const rawMessage =
        error?.message ??
        error?.response?.data?.message ??
        'Google sign-in failed. Please try again.';
      const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);

      showAppToast(toast, {
        action: resolveToastAction('error'),
        title: 'Google sign-in failed',
        description: message,
        duration: 3500,
      });
    } 
    finally {
      setIsGoogleSigningIn(false);
    }
  };

  const onForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const onGoSignUp = () => {
    router.push('/(auth)/sign-up');
  };

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
    <ImageBackground
      source={{ uri: assets[0].localUri ?? assets[0].uri }}
      style={sc.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={sc.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={sc.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={sc.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={sc.card}>
              <MaliLogo 
                theme={theme} 
                title='Welcome back'
                subTitle='Sign in to continue to your account.'
                />

              <FormInput
                label="Email Address"
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormInput
                label="Password"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                secureTextEntry
                autoCapitalize="none"
              />

              <Pressable onPress={onForgotPassword} style={sc.forgotWrap} hitSlop={8}>
                <Text style={sc.forgotText}>Forgot Password?</Text>
              </Pressable>

              <Pressable
                onPress={onSignIn}
                style={[sc.signInBtn, (!canSubmit || isSigningIn) && sc.signInBtnDisabled]}
                disabled={!canSubmit || isSigningIn}
              >
                <Text style={sc.signInText}>{isSigningIn ? 'Signing In...' : 'Sign In'}</Text>
              </Pressable>

              <View style={sc.dividerRow}>
                <View style={sc.dividerLine} />
                <Text style={sc.dividerText}>or continue with</Text>
                <View style={sc.dividerLine} />
              </View>

              <View style={sc.socialRow}>
                <SocialButton
                  label={isGoogleSigningIn ? 'Signing in...' : 'Google'}
                  icon="logo-google"
                  onPress={onGoogleSignIn}
                  disabled={isGoogleSigningIn}
                />
              </View>

              <View style={sc.footerRow}>
                <Text style={sc.footerText}>Don&apos;t have an account?</Text>
                <Pressable onPress={onGoSignUp} hitSlop={8}>
                  <Text style={sc.footerLink}> Sign Up</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bgImage: {
      flex: 1,
      width: '100%',
    },

    safe: {
      flex: 1,
    },
    keyboard: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 18,
    },

    card: {
      borderRadius: 28,
      borderWidth: 1,      
      borderColor: theme.cardTBorder,
      backgroundColor: theme.cardT,
      paddingHorizontal: 18,
      paddingVertical: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 12,
    },
        
    forgotWrap: {
      alignSelf: 'flex-end',
      marginTop: 2,
      marginBottom: 14,
    },
    forgotText: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: theme.primary,
      fontWeight: '600',
    },

    signInBtn: {
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
    },
    signInBtnDisabled: {
      backgroundColor: theme.disabledSurface,
      shadowOpacity: 0.12,
      elevation: 2,
    },
    signInText: {
      fontFamily: Fonts.sans,
      color: theme.onPrimary,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    dividerRow: {
      marginTop: 14,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.subtleBorder,
    },
    dividerText: {
      fontFamily: Fonts.sans,
      color: theme.textDim,
      fontSize: 12,
    },

    socialRow: {
      flexDirection: 'row',
      gap: 10,
    },    

    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    footerText: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: theme.textDim,
    },
    footerLink: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: theme.primary,
      fontWeight: '700',
    },
  });