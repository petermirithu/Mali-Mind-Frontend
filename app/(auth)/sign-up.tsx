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
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssets } from 'expo-asset';

import { useTheme } from '@/contexts/theme-context';
import { Fonts } from '@/constants/fonts';
import type { ThemeColors } from '@/constants/theme';
import { registerWithEmail } from '@/authentication/firebase-auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

type FieldState = {
  fullName: string;
  email: string;
  password: string;
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
      <Text style={sc.logoSub}>Create your account</Text>
      <Text style={sc.logoHint}>Join Mali and take control of your financial future.</Text>
    </View>
  );
}

type InputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

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
          placeholder={placeholder}
          placeholderTextColor={theme.textDim}
          style={sc.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8} style={sc.eyeBtn}>
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
}: {
  label: string;
  icon: 'logo-google';
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const sc = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable style={sc.socialBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={theme.text} />
      <Text style={sc.socialText}>{label}</Text>
    </Pressable>
  );
}

export default function SignUp() {
  const { theme } = useTheme();
  const sc = useMemo(() => makeStyles(theme), [theme]);
  const toast = useToast();  
  const { signUp } = useAuth();
  const { mutateAsync: createProfile } = signUp;

  const [assets] = useAssets([require('../../assets/backgrounds/earth_up.png')]);

  const [form, setForm] = useState<FieldState>({
    fullName: '',
    email: '',
    password: '',
  });
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      toast.show({
        placement: 'bottom',
        duration: 4200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="outline">
            <ToastTitle>Sign up failed</ToastTitle>
            <ToastDescription numberOfLines={3}>{message}</ToastDescription>
          </Toast>
        ),
      });
      setIsSubmitting(false);
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
              <MaliLogo theme={theme} />

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
                  {agree ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
                </View>
                <Text style={sc.termsText}>
                  I agree to the <Text style={sc.linkText}>Terms of Service</Text> and{' '}
                  <Text style={sc.linkText}>Privacy Policy</Text>
                </Text>
              </Pressable>

              <Pressable
                style={[sc.signUpBtn, (!canSubmit || isSubmitting) && sc.signUpBtnDisabled]}
                onPress={onCreateAccount}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#F7FFF9" />
                ) : (
                  <Text style={sc.signUpText}>Create Account</Text>
                )}
              </Pressable>

              <View style={sc.dividerRow}>
                <View style={sc.dividerLine} />
                <Text style={sc.dividerText}>or continue with</Text>
                <View style={sc.dividerLine} />
              </View>

              <View style={sc.socialRow}>
                <SocialButton label="Google" icon="logo-google" onPress={() => { }} />
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
      backgroundColor: '#040910',
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
      borderColor: 'rgba(255,255,255,0.35)',
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

    signUpBtn: {
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
    signUpBtnDisabled: {
      backgroundColor: '#3E4A5E',
      shadowOpacity: 0.12,
      elevation: 2,
    },
    signUpText: {
      fontFamily: Fonts.sans,
      color: '#F7FFF9',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.2,
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