import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssets } from 'expo-asset';
import { Text, View } from '@gluestack-ui/themed';
import { useTheme } from '@/contexts/theme-context';
import { Fonts } from '@/constants/fonts';
import type { ThemeColors } from '@/constants/theme';
import { resolveToastAction, showAppToast, useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';

type VerifyBody = {
    email: string;
    code: string;
};

function MaliLogo({ theme, safeEmail }: { theme: ThemeColors, safeEmail: string }) {
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
            <Text style={sc.logoSub}>Verify your account</Text>
            <Text style={sc.logoHint}>We sent a verification code to your email:</Text>
            <Text style={sc.emailValue}>{safeEmail || 'No email provided'}</Text>
        </View>
    );
}

export default function Verification() {
    const { theme } = useTheme();
    const sc = useMemo(() => makeStyles(theme), [theme]);
    const toast = useToast();
    const [assets] = useAssets([require('../../assets/backgrounds/earth_up.png')]);

    const { verifyEmail, resendVerification } = useAuth();
    const { mutateAsync: verifyEmailAsync } = verifyEmail;
    const { mutateAsync: resendVerificationAsync } = resendVerification;

    const params = useLocalSearchParams<{ email?: string }>();

    const [code, setCode] = useState('');
    const safeEmail = (params.email ?? '').toString().trim();
    const canSubmit = safeEmail.length > 3 && code.trim().length >= 4;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const onSubmitVerification = async () => {
        if (!canSubmit || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const payload: VerifyBody = {
                email: safeEmail.trim(),
                code: code.trim(),
            };

            const response = await verifyEmailAsync(payload);

            if (response.status == "success") {
                showAppToast(toast, {
                    action: resolveToastAction('success'),
                    title: 'Success',
                    description: 'Email verified successfully. Please sign in.',
                    duration: 3200,
                });
                router.replace('/(auth)/sign-in');
            }
            else{
                showAppToast(toast, {
                    action: resolveToastAction(response.status),
                    title: response.status,
                    description: response.message,
                    duration: 3200,
                });
            }
        } catch (error: any) {
            const rawMessage =
                error?.response?.data?.message ??
                error?.message ??
                'Unable to verify code. Please try again.';
            const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);

            showAppToast(toast, {
                action: resolveToastAction('error'),
                title: 'Verification failed',
                description: message,
                duration: 4200,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onResendCode = async () => {
        if (!safeEmail.trim() || isResending) return;

        setIsResending(true);
        try {
            const response = await resendVerificationAsync({ email: safeEmail.trim() });

            showAppToast(toast, {
                action: resolveToastAction(response.status),
                title: response.status,
                description: response.message,
                duration: 3200,
            });
        } catch (error: any) {
            const rawMessage =
                error?.response?.data?.message ??
                error?.message ??
                'Unable to resend verification code.';
            const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);

            showAppToast(toast, {
                action: resolveToastAction('error'),
                title: 'Verification failed',
                description: message,
                duration: 4200,
            });
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => {
        if (!safeEmail) {
            showAppToast(toast, {
                action: resolveToastAction('warning'),
                title: 'Email required',
                description: 'Please sign up again to receive a verification code.',
                duration: 3000,
            });
            router.replace('/(auth)/sign-up');
        }
    }, [safeEmail, toast]);

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
                            <MaliLogo theme={theme} safeEmail={safeEmail} />

                            <View style={sc.inputGroup}>
                                <Text style={sc.inputLabel}>Verification Code</Text>
                                <View style={sc.inputWrap}>
                                    <Ionicons name="key-outline" size={16} color={theme.textDim} style={sc.inputIcon} />
                                    <TextInput
                                        placeholder="Enter code"
                                        placeholderTextColor={theme.textDim}
                                        style={sc.input}
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="numeric"
                                        autoCapitalize="none"                                        
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            <Pressable
                                style={[sc.primaryBtn, (!canSubmit || isSubmitting) && sc.primaryBtnDisabled]}
                                onPress={onSubmitVerification}
                                disabled={!canSubmit || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={theme.onPrimary} />
                                ) : (
                                    <Text style={sc.primaryBtnText}>Verify Account</Text>
                                )}
                            </Pressable>

                            <Pressable
                                style={[sc.secondaryBtn, isResending && sc.secondaryBtnDisabled]}
                                onPress={onResendCode}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <ActivityIndicator color={theme.text} />
                                ) : (
                                    <Text style={sc.secondaryBtnText}>Resend Verification Code</Text>
                                )}
                            </Pressable>

                            <View style={sc.footerRow}>
                                <Text style={sc.footerText}>Need to edit details?</Text>
                                <Link href="/(auth)/sign-up" style={sc.footerLink}>
                                    {' '}
                                    Go Back to Sign Up
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
            borderColor: theme.glassBorder,
            backgroundColor: theme.glassSurface,
            paddingHorizontal: 18,
            paddingVertical: 20,
            shadowColor: theme.shadow,
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
            marginBottom: 12,
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
            borderColor: theme.inputBorder,
            backgroundColor: theme.inputSurface,
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
        primaryBtn: {
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
            marginTop: 6,
            marginBottom: 10,
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
        secondaryBtn: {
            height: 46,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.subtleBorder,
            backgroundColor: theme.subtleSurface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        secondaryBtnDisabled: {
            opacity: 0.6,
        },
        secondaryBtnText: {
            fontFamily: Fonts.sans,
            color: theme.text,
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 0.2,
        },
        footerRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 8,
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

        emailValue: {
            marginTop: 6,
            marginBottom: 2,
            fontFamily: Fonts.sans,
            fontSize: 14,
            fontWeight: '700',
            color: theme.text,
            textAlign: 'center',
        },
    });