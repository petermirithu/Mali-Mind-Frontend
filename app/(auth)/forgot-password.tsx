import { Ionicons } from '@expo/vector-icons';
import { useAssets } from 'expo-asset';
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

import { Fonts } from '../../constants/fonts';
import type { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/theme-context';
import { useAuth } from '@/hooks/use-auth';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';

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
            <Text style={sc.logoSub}>Reset password</Text>
            <Text style={sc.logoHint}>
                Enter your account email and we&apos;ll send a reset link.
            </Text>
        </View>
    );
}

function EmailInput({
    value,
    onChangeText,
}: {
    value: string;
    onChangeText: (text: string) => void;
}) {
    const { theme } = useTheme();
    const sc = useMemo(() => makeStyles(theme), [theme]);

    return (
        <View style={sc.inputGroup}>
            <Text style={sc.inputLabel}>Email Address</Text>
            <View style={sc.inputWrap}>
                <Ionicons name="mail-outline" size={16} color={theme.textDim} style={sc.inputIcon} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Enter email address"
                    placeholderTextColor={theme.textDim}
                    style={sc.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
        </View>
    );
}

export default function ForgotPassword() {
    const { theme } = useTheme();
    const sc = useMemo(() => makeStyles(theme), [theme]);
    const router = useRouter();
    const toast = useToast();
    const [assets] = useAssets([require('../../assets/backgrounds/earth_up.png')]);

    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const canSubmit = email.trim().includes('@');

    const { forgotPassword } = useAuth();


    const onSubmit = async () => {
        if (!canSubmit || forgotPassword.isPending) return;

        try {
            const response = await forgotPassword.mutateAsync({ email: email.trim() });

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

            setIsSent(true);

            if (response.status == "success") {
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { email: email.trim() },
                });                
            }
        }
        catch (error) {
            setIsSent(false);
            toast.show({
                placement: 'bottom',
                duration: 3000,
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
                        <ToastTitle>Email required</ToastTitle>
                        <ToastDescription>Please sign up again to receive a verification code.</ToastDescription>
                    </Toast>
                ),
            });
        }
    };

    const onBackToSignIn = () => {
        router.replace('/(auth)/sign-in');
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

                            <EmailInput value={email} onChangeText={setEmail} />

                            {isSent ? (
                                <View style={sc.successWrap}>
                                    <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                                    <Text style={sc.successText}>
                                        Reset code sent. Check your email to get it.
                                    </Text>
                                </View>
                            ) : null}

                            <Pressable
                                onPress={onSubmit}
                                style={[sc.primaryBtn, (!canSubmit || forgotPassword.isPending) && sc.primaryBtnDisabled]}
                                disabled={!canSubmit || forgotPassword.isPending}
                            >
                                <Text style={sc.primaryBtnText}>
                                    {forgotPassword.isPending ? 'Sending...' : 'Submit'}
                                </Text>
                            </Pressable>

                            <View style={sc.dividerRow}>
                                <View style={sc.dividerLine} />
                                <Text style={sc.dividerText}>or</Text>
                                <View style={sc.dividerLine} />
                            </View>

                            <Pressable onPress={onBackToSignIn} style={sc.backBtn} hitSlop={8}>
                                <Ionicons name="arrow-back" size={16} color={theme.text} />
                                <Text style={sc.backBtnText}>Back to Sign In</Text>
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