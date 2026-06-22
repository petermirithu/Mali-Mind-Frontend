import React, { useEffect } from 'react';
import { config } from './config';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';
import { useTheme } from '@/contexts/theme-context';

export type ModeType = 'light' | 'dark' | 'system';

export function GluestackUIProvider({
  mode,
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { mode: appMode } = useTheme(); 
  const resolvedMode: ModeType = mode ?? appMode;
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(resolvedMode);
  }, [resolvedMode, setColorScheme]);

  return (
    <View
      style={[
        config[colorScheme!],
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
