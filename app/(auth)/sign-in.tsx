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
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import { Fonts } from '../../constants/fonts';
import type { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/theme-context';
import { loginWithEmail, loginWithGoogleNative } from '../../authentication/firebase-auth';
import { useToast, Toast, ToastTitle } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type InputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function MaliLogo({ theme }: { theme: ThemeColors }) {
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
      <Text style={sc.logoSub}>welcomes back</Text>
      <Text style={sc.logoHint}>Sign in to continue to your account.</Text>
    </View>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: InputProps) {
  const { theme } = useTheme();
  const sc = useMemo(() => makeStyles(theme), [theme]);
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  return (
    <View style={sc.inputGroup}>
      <Text style={sc.inputLabel}>{label}</Text>
      <View style={sc.inputWrap}>
        <Ionicons name={icon} size={16} color={theme.textDim} style={sc.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textDim}
          style={sc.input}
          keyboardType={keyboardType}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((prev) => !prev)} hitSlop={8} style={sc.eyeBtn}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={theme.textDim}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function SocialButton({
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

      toast.show({
        placement: 'bottom',
        duration: 3500,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="outline">
            <ToastTitle>{message}</ToastTitle>
          </Toast>
        ),
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
      const rawMessage =
        error?.message ??
        error?.response?.data?.message ??
        'Google sign-in failed. Please try again.';
      const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);

      toast.show({
        placement: 'bottom',
        duration: 3500,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="outline">
            <ToastTitle>{message}</ToastTitle>
          </Toast>
        ),
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
              <MaliLogo theme={theme} />

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
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor: 'rgba(8,14,24,0.5)',
      paddingHorizontal: 18,
      paddingVertical: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 12,
    },

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
      top: 4,
      right: 1,
      width: 10,
      height: 10,
      borderRadius: 5,
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

    inputGroup: {
      marginBottom: 10,
    },
    inputLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: theme.textDim,
      marginBottom: 6,
      marginLeft: 2,
    },
    inputWrap: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.10)',
      backgroundColor: 'rgba(255,255,255,0.03)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      color: theme.text,
      fontFamily: Fonts.sans,
      fontSize: 14,
      paddingVertical: 10,
    },
    eyeBtn: {
      paddingLeft: 8,
      paddingVertical: 4,
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
      backgroundColor: '#3E4A5E',
      shadowOpacity: 0.12,
      elevation: 2,
    },
    signInText: {
      fontFamily: Fonts.sans,
      color: '#F7FFF9',
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
      backgroundColor: 'rgba(255,255,255,0.12)',
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