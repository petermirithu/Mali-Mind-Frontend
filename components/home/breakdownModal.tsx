import { useTheme } from "@/contexts/theme-context";
import { ScrollView, Text, View } from "@gluestack-ui/themed";
import { Modal, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";

export default function BreakdownModal({
    visible,
    title,
    onClose,
    children,
}: {
    visible: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const { theme } = useTheme();
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View
                    style={styles.modalContent}
                    backgroundColor={theme.surface}
                    borderColor={theme.cardBorder}
                    onStartShouldSetResponder={() => true}>
                    <View style={styles.modalHeader} borderBottomColor={theme.cardBorder}>
                        <Text style={styles.modalTitle} color={theme.text}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.modalCloseBtn} color={theme.textDim}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {children}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(13, 17, 23, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        borderWidth: 1,
        borderRadius: 24,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingBottom: 16,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalCloseBtn: {
        fontSize: 18,
    },
    modalBody: {
        marginVertical: 4,
    }
});
