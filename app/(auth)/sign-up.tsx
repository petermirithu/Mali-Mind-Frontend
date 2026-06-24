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
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssets } from 'expo-asset';
import { Text, View } from '@gluestack-ui/themed';
import { useTheme } from '@/contexts/theme-context';
import { Fonts } from '@/constants/fonts';
import type { ThemeColors } from '@/constants/theme';
import { loginWithGoogleNative, registerWithEmail } from '@/authentication/firebase-auth';
import { useAuth } from '@/hooks/use-auth';
import { resolveToastAction, showAppToast, useToast } from '@/components/ui/toast';
import SocialButton from '@/components/auth/socialButton';
import MaliLogo from '@/components/auth/maliLogo';
import FormInput from '@/components/auth/formInput';
import ButtonRound from '@/components/auth/buttonRound';

type FieldState = {
  fullName: string;
  email: string;
  password: string;
};

export default function SignUp() {
  const { theme } = useTheme();
  const sc = useMemo(() => makeStyles(theme), [theme]);
  const toast = useToast();
  const { signUp, socialAuth } = useAuth();
  const { mutateAsync: createProfile } = signUp;
  const { mutateAsync: socialFetchProfile } = socialAuth;

  const [assets] = useAssets([require('../../assets/backgrounds/earth_up.png')]);

  const [form, setForm] = useState<FieldState>({
    fullName: '',
    email: '',
    password: '',
  });
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const canSubmit =
    form.fullName.trim().length > 1 &&
    form.email.includes('@') &&
    form.password.trim().length >= 8 &&
    agree;

  const updateField = (key: keyof FieldState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onCreateAccount = async () => {    
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const user = await registerWithEmail(form.email.trim(), form.password);
      const token = await user.getIdToken();

      await createProfile({
        fullname: form.fullName.trim(),
        email: form.email.trim(),
        firebase_uid: user.uid,
        token,
      });
      setIsSubmitting(false);
      router.push({
        pathname: '/(auth)/verification',
        params: { email: form.email.trim() },
      });
    }
    catch (error: any) {
      const rawMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Unable to create account. Please try again.';

      const message =
        typeof rawMessage === 'string'
          ? rawMessage
          : JSON.stringify(rawMessage);

      showAppToast(toast, {
        action: resolveToastAction('error'),
        title: 'Sign up failed',
        description: message,
        duration: 4200,
      });
      setIsSubmitting(false);
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
                title='Create your account'
                subTitle='Join Mali and take control of your financial future.'
              />

              <FormInput
                label="Full Name"
                placeholder="Full Name"
                value={form.fullName}
                onChangeText={(v) => updateField('fullName', v)}
                icon="person-outline"
                autoCapitalize="words"
              />

              <FormInput
                label="Email Address"
                placeholder="Email Address"
                value={form.email}
                onChangeText={(v) => updateField('email', v)}
                icon="mail-outline"
                keyboardType="email-address"
              />

              <FormInput
                label="Password"
                placeholder="Password"
                value={form.password}
                onChangeText={(v) => updateField('password', v)}
                icon="lock-closed-outline"
                secureTextEntry
              />

              <Pressable style={sc.termsRow} onPress={() => setAgree((v) => !v)}>
                <View style={[sc.checkbox, agree && sc.checkboxChecked]}>
                  {agree ? <Ionicons name="checkmark" size={12} color={theme.onPrimary} /> : null}
                </View>
                <Text style={sc.termsText}>
                  I agree to the <Text style={sc.linkText}>Terms of Service</Text> and{' '}
                  <Text style={sc.linkText}>Privacy Policy</Text>
                </Text>
              </Pressable>

              <ButtonRound
                theme={theme}
                onPress={onCreateAccount}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                title='Sign Up'
                loadingText='Signing Up ...'
              />

              <View style={sc.dividerRow}>
                <View style={sc.dividerLine} />
                <Text style={sc.dividerText}>or continue with</Text>
                <View style={sc.dividerLine} />
              </View>

              <View style={sc.socialRow}>
                <SocialButton
                  label={isGoogleSigningIn ? 'Signing In...' : 'Google'}
                  icon="logo-google"
                  onPress={onGoogleSignIn}
                  disabled={isGoogleSigningIn}
                />
              </View>

              <View style={sc.footerRow}>
                <Text style={sc.footerText}>Already have an account?</Text>
                <Link href="/(auth)/sign-in" style={sc.footerLink}>
                  {' '}
                  Sign In
                </Link>
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
      backgroundColor: theme.background,
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


    termsRow: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 14,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 5,
      marginTop: 1,
      borderWidth: 1.2,
      borderColor: theme.inputBorder,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    termsText: {
      flex: 1,
      color: theme.textDim,
      fontSize: 12.5,
      lineHeight: 18,
      fontFamily: Fonts.sans,
    },
    linkText: {
      color: theme.primary,
      fontWeight: '700',
    },

    dividerRow: {
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