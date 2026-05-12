import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@gluestack-ui/themed';

import { useTheme } from '@/contexts/theme-context';

export default function ProfileScreen() {
  const { mode, theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Profile</Text>
      <Text style={[styles.subtitle, { color: theme.textDim }]}>Personalize MaliMind and choose your preferred theme.</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
        <Text fontWeight="700" style={[styles.cardTitle, { color: theme.text }]}>Hello, Alex</Text>
        <Text style={[styles.cardText, { color: theme.textDim }]}>MaliMind helps you stay in control of daily costs, trends, and spending impact.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
        <Text fontWeight="700" style={[styles.sectionTitle, { color: theme.text }]}>Theme</Text>
        <Text style={[styles.cardText, { color: theme.textDim, marginBottom: 16 }]}>Toggle between dark and light mode to match your environment.</Text>
        <Pressable style={[styles.toggleButton, { backgroundColor: theme.primary }]} onPress={toggleTheme}>
          <Text fontWeight="700" style={styles.toggleText}>{mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
        <Text fontWeight="700" style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: theme.textDim }]}>Email</Text>
          <Text style={[styles.fieldValue, { color: theme.text }]}>alex@mali.ai</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: theme.textDim }]}>Plan</Text>
          <Text style={[styles.fieldValue, { color: theme.text }]}>Professional</Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  toggleButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#FFF',
    fontSize: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 14,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
