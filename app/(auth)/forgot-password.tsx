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
import ButtonRound from '@/components/auth/buttonRound';


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

            showAppToast(toast, {
                action: resolveToastAction(response.status),
                title: response.status,
                description: response.message,
                duration: 5000,
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
            showAppToast(toast, {
                action: resolveToastAction('warning'),
                title: 'Email required',
                description: 'Please sign up again to receive a verification code.',
                duration: 3000,
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
                            <MaliLogo
                                theme={theme}
                                title='Forgot password'
                                subTitle='Enter your account email and we&apos;ll send a reset code.'
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

                            {isSent ? (
                                <View style={sc.successWrap}>
                                    <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                                    <Text style={sc.successText}>
                                        Reset code sent. Check your email to get it.
                                    </Text>
                                </View>
                            ) : null}

                            <View marginTop={20}>
                                <ButtonRound
                                    theme={theme}
                                    onPress={onSubmit}
                                    canSubmit={canSubmit}
                                    isSubmitting={forgotPassword.isPending}
                                    title='Submit'
                                    loadingText='Submitting ...'
                                />
                            </View>

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