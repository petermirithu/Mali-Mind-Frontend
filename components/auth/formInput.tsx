import { Fonts } from '@/constants/fonts';
import { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@gluestack-ui/themed';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

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

export default function FormInput({
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

const makeStyles = (theme: ThemeColors) =>
    StyleSheet.create({
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
        eyeBtn: {
            paddingLeft: 8,
            paddingVertical: 4,
        },
    });