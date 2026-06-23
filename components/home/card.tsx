import { useTheme } from "@/contexts/theme-context";
import { View } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";

export default function Card({ children, style }: { children: React.ReactNode; style?: object }) {
    const { theme } = useTheme();
    return <View style={[styles.card, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder, shadowColor: theme.shadow }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 18,
        marginBottom: 14,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 6,
    },
});