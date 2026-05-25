import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="light" />
          </QueryClientProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
