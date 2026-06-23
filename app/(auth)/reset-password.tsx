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
    Text,    
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '../../constants/fonts';
import type { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/theme-context';
import { useAuth } from '@/hooks/use-auth';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
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
            toast.show({
                placement: 'bottom',
                duration: 3000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
                        <ToastTitle>Email required</ToastTitle>
                        <ToastDescription>Please go back & enter a valid email address.</ToastDescription>
                    </Toast>
                ),
            });
            return;
        }

        if (!hasCode) {
            toast.show({
                placement: 'bottom',
                duration: 3000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
                        <ToastTitle>Invalid code</ToastTitle>
                        <ToastDescription>Verification code must be at least 4 characters.</ToastDescription>
                    </Toast>
                ),
            });
            return;
        }

        if (!hasStrongPassword) {
            toast.show({
                placement: 'bottom',
                duration: 4000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
                        <ToastTitle>Password policy not met</ToastTitle>
                        <ToastDescription>
                            Use at least 8 chars, uppercase, lowercase, number and special character.
                        </ToastDescription>
                    </Toast>
                ),
            });
            return;
        }

        if (!passwordsMatch) {
            toast.show({
                placement: 'bottom',
                duration: 3000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
                        <ToastTitle>Passwords do not match</ToastTitle>
                        <ToastDescription>Please make sure both password fields are identical.</ToastDescription>
                    </Toast>
                ),
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

            toast.show({
                placement: 'bottom',
                duration: 5000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action={response.status} variant="outline">
                        <ToastTitle>{response.status}</ToastTitle>
                        <ToastDescription numberOfLines={3}>{response.message}</ToastDescription>
                    </Toast>
                ),
            });

            if (response.status == "success") {
                router.replace('/(auth)/sign-in');
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ??
                'Unable to reset password. Please check your code and try again.';

            setSubmitted(false);

            toast.show({
                placement: 'bottom',
                duration: 4000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="outline">
                        <ToastTitle>Reset failed</ToastTitle>
                        <ToastDescription numberOfLines={3}>{message}</ToastDescription>
                    </Toast>
                ),
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
        
        errorText: {
            marginTop: 2,
            marginBottom: 10,
            fontFamily: Fonts.sans,
            fontSize: 12,
            color: '#FF7B7B',
            fontWeight: '600',
        },

        successWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: 'rgba(146, 255, 177, 0.35)',
            backgroundColor: 'rgba(146, 255, 177, 0.08)',
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
            backgroundColor: '#3E4A5E',
            shadowOpacity: 0.12,
            elevation: 2,
        },
        primaryBtnText: {
            fontFamily: Fonts.sans,
            color: '#F7FFF9',
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
            borderColor: 'rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(255,255,255,0.02)',
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
            backgroundColor: 'rgba(255,255,255,0.12)',
        },
        dividerText: {
            fontFamily: Fonts.sans,
            color: theme.textDim,
            fontSize: 12,
        },
    });