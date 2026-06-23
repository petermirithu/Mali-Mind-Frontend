import { Ionicons } from '@expo/vector-icons';
import { useAssets } from 'expo-asset';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Text, View } from '@gluestack-ui/themed';

import { Fonts } from '../../constants/fonts';
import type { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/theme-context';
import { useAuth } from '@/hooks/use-auth';
import { resolveToastAction, showAppToast, useToast } from '@/components/ui/toast';
import MaliLogo from '@/components/auth/maliLogo';
import FormInput from '@/components/auth/formInput';

export default function ResetPassword() {
    const { theme } = useTheme();
    const sc = useMemo(() => makeStyles(theme), [theme]);
    const router = useRouter();
    const toast = useToast();
    const [assets] = useAssets([require('../../assets/backgrounds/earth_up.png')]);

    const params = useLocalSearchParams<{ email?: string }>();
    const safeEmail = (params.email ?? '').toString().trim();

    const { resetPassword } = useAuth();

    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);

    const passwordsMatch =
        newPassword.trim().length > 0 && confirmPassword.trim().length > 0 && newPassword === confirmPassword;
    const hasStrongPassword =
        newPassword.trim().length >= 8 &&
        hasUppercase &&
        hasLowercase &&
        hasNumber &&
        hasSpecialChar;
    const hasCode = verificationCode.trim().length >= 4;
    const hasEmail = safeEmail.trim().includes('@');
    const canSubmit = hasEmail && hasCode && hasStrongPassword && passwordsMatch;

    const onResetPassword = async () => {
        if (resetPassword.isPending) return;

        if (!hasEmail) {
            showAppToast(toast, {
                action: resolveToastAction('warning'),
                title: 'Email required',
                description: 'Please go back and enter a valid email address.',
                duration: 3000,
            });
            return;
        }

        if (!hasCode) {
            showAppToast(toast, {
                action: resolveToastAction('warning'),
                title: 'Invalid code',
                description: 'Verification code must be at least 4 characters.',
                duration: 3000,
            });
            return;
        }

        if (!hasStrongPassword) {
            showAppToast(toast, {
                action: resolveToastAction('warning'),
                title: 'Password policy not met',
                description: 'Use at least 8 characters, uppercase, lowercase, a number, and a special character.',
                duration: 4000,
            });
            return;
        }

        if (!passwordsMatch) {
            showAppToast(toast, {
                action: resolveToastAction('warning'),
                title: 'Passwords do not match',
                description: 'Please make sure both password fields are identical.',
                duration: 3000,
            });
            return;
        }

        try {
            const response = await resetPassword.mutateAsync({
                email: safeEmail.trim().toLowerCase(),
                code: verificationCode.trim(),
                password: newPassword,
            });

            setSubmitted(true);

            showAppToast(toast, {
                action: resolveToastAction(response.status),
                title: response.status,
                description: response.message,
                duration: 5000,
            });

            if (response.status == "success") {
                router.replace('/(auth)/sign-in');
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ??
                'Unable to reset password. Please check your code and try again.';

            setSubmitted(false);

            showAppToast(toast, {
                action: resolveToastAction('error'),
                title: 'Reset failed',
                description: message,
                duration: 4000,
            });
        }
    };

    const onBack = () => {
        router.replace('/(auth)/forgot-password');
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
                                title='Reset password'
                                subTitle='Enter the verification code from your email & create a new password.'
                            />

                            <FormInput
                                label="Verification Code"
                                placeholder="Enter verification code"
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                                icon="key-outline"
                                keyboardType="number-pad"
                                autoCapitalize="none"
                            />

                            <FormInput
                                label="New Password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                icon="lock-closed-outline"
                                secureTextEntry
                                autoCapitalize="none"
                            />

                            <FormInput
                                label="Confirm Password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                icon="shield-checkmark-outline"
                                secureTextEntry
                                autoCapitalize="none"
                            />

                            {!passwordsMatch && confirmPassword.length > 0 ? (
                                <Text style={sc.errorText}>Passwords do not match.</Text>
                            ) : null}

                            <Pressable
                                onPress={onResetPassword}
                                style={[sc.primaryBtn, (!canSubmit || resetPassword.isPending) && sc.primaryBtnDisabled]}
                                disabled={!canSubmit || resetPassword.isPending}
                            >
                                <Text style={sc.primaryBtnText}>
                                    {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
                                </Text>
                            </Pressable>

                            <View style={sc.dividerRow}>
                                <View style={sc.dividerLine} />
                                <Text style={sc.dividerText}>or</Text>
                                <View style={sc.dividerLine} />
                            </View>

                            <Pressable onPress={onBack} style={sc.backBtn} hitSlop={8}>
                                <Ionicons name="arrow-back" size={16} color={theme.text} />
                                <Text style={sc.backBtnText}>Back</Text>
                            </Pressable>
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

        errorText: {
            marginTop: 2,
            marginBottom: 10,
            fontFamily: Fonts.sans,
            fontSize: 12,
            color: theme.danger,
            fontWeight: '600',
        },

        successWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.successBorder,
            backgroundColor: theme.successSurface,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 9,
        },
        successText: {
            flex: 1,
            color: theme.text,
            fontFamily: Fonts.sans,
            fontSize: 12,
            lineHeight: 16,
        },

        primaryBtn: {
            marginTop: 4,
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
        primaryBtnDisabled: {
            backgroundColor: theme.disabledSurface,
            shadowOpacity: 0.12,
            elevation: 2,
        },
        primaryBtnText: {
            fontFamily: Fonts.sans,
            color: theme.onPrimary,
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: 0.2,
        },

        backBtn: {
            flex: 1,
            height: 44,
            paddingVertical: 5,
            borderRadius: 11,
            borderWidth: 1,
            borderColor: theme.subtleBorder,
            backgroundColor: theme.subtleSurface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },
        backBtnText: {
            fontFamily: Fonts.sans,
            color: theme.text,
            fontSize: 14,
            fontWeight: '700',
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
    });