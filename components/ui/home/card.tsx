import { useTheme } from "@/contexts/theme-context";
import { StyleSheet, View } from "react-native";

export default function Card({ children, style }: { children: React.ReactNode; style?: object }) {
    const { theme } = useTheme();
    return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 6,
    },
});