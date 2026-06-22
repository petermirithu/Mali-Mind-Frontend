import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { ReactNode, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import ReduxStore from '../redux/Store';
import { onAuthStateChanged } from 'firebase/auth';
import { FireBaseAuth } from '@/authentication/firebase-config';
import { setAuthReady, setIsAuthenticated } from '@/redux/UserProfileSlice';
import { useAuth } from '@/hooks/use-auth';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

function AuthInitializer({ children }: ProvidersProps) {
  const dispatch = useDispatch();
  const { getMe } = useAuth();
  const { mutateAsync: fetchProfile } = getMe;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FireBaseAuth, async (user) => {
      try {
        if (!user) {
          dispatch(setIsAuthenticated(false));
          dispatch(setAuthReady(true));
          return;
        }

        const token = await user.getIdToken();
        const email = user.email?.trim();

        if (!email) {
          dispatch(setIsAuthenticated(false));
          dispatch(setAuthReady(true));
          return;
        }

        await fetchProfile({ token, email });
        dispatch(setIsAuthenticated(true));
      }
      catch (error) {
        dispatch(setIsAuthenticated(false));
      }
      finally {
        dispatch(setAuthReady(true));
      }
    });

    return () => unsubscribe();
  }, [dispatch, fetchProfile]);

  return <>{children}</>;
}

function RouteGuard({ children }: ProvidersProps) {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  const { isAuthenticated, authReady } = useSelector((state: any) => state.userProfile);

  useEffect(() => {
    if (!authReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [authReady, isAuthenticated, segments, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={ReduxStore}>
      <ThemeProvider>
        <GluestackUIProvider>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <AuthInitializer>
                <RouteGuard>
                  <Stack>
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="mali-chat" options={{ headerShown: false }} />
                  </Stack>
                  <StatusBar style="light" />
                </RouteGuard>
              </AuthInitializer>
            </QueryClientProvider>
          </SafeAreaProvider>
        </GluestackUIProvider>
      </ThemeProvider>
    </Provider>
  );
}