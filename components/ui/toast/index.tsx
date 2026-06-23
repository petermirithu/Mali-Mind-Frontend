'use client';
import React from 'react';
import { createToastHook } from '@gluestack-ui/core/toast/creator';
import { AccessibilityInfo, Text, View, ViewStyle } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';
import {
  withStyleContext,
  useStyleContext,
} from '@gluestack-ui/utils/nativewind-utils';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { useTheme } from '@/contexts/theme-context';
import { Fonts } from '@/constants/fonts';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;
const useToast = createToastHook(MotionView, AnimatePresence);
const SCOPE = 'TOAST';

cssInterop(MotionView, { className: 'style' });

const toastStyle = tva({
  base: 'web:pointer-events-auto',
  variants: {
    action: {
      error: '',
      warning: '',
      success: '',
      info: '',
      muted: '',
    },
    variant: {
      solid: '',
      outline: '',
    },
  },
});

const toastTitleStyle = tva({
  base: '',
  variants: {
    isTruncated: { true: '' },
    bold: { true: '' },
    underline: { true: '' },
    strikeThrough: { true: '' },
    size: {
      '2xs': '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      '2xl': '',
      '3xl': '',
      '4xl': '',
      '5xl': '',
      '6xl': '',
    },
  },
});

const toastDescriptionStyle = tva({
  base: '',
  variants: {
    isTruncated: { true: '' },
    bold: { true: '' },
    underline: { true: '' },
    strikeThrough: { true: '' },
    size: {
      '2xs': '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      '2xl': '',
      '3xl': '',
      '4xl': '',
      '5xl': '',
      '6xl': '',
    },
  },
});

const Root = withStyleContext(View, SCOPE);

type ToastAction = 'error' | 'warning' | 'success' | 'info' | 'muted';

type IToastContext = {
  textColor?: string;
  titleColor?: string;
};

type IToastProps = React.ComponentProps<typeof Root> & {
  className?: string;
  textColor?: string;
  titleColor?: string;
} & VariantProps<typeof toastStyle>;

const Toast = React.forwardRef<React.ComponentRef<typeof Root>, IToastProps>(
  function Toast(
    {
      className,
      variant = 'solid',
      action = 'muted',
      style,
      textColor,
      titleColor,
      ...props
    },
    ref
  ) {
    const { theme } = useTheme();

    const palette: Record<
      ToastAction,
      { bg: string; border: string; stripe: string; title: string; text: string }
    > = {
      error: {
        bg: theme.dangerDim,
        border: theme.danger,
        stripe: theme.danger,
        title: theme.text,
        text: theme.text,
      },
      warning: {
        bg: theme.warningDim ?? 'rgba(217,119,6,0.14)',
        border: theme.warning,
        stripe: theme.warning,
        title: theme.text,
        text: theme.text,
      },
      success: {
        bg: theme.greenDim,
        border: theme.success,
        stripe: theme.success,
        title: theme.text,
        text: theme.text,
      },
      info: {
        bg: theme.accentDim ?? 'rgba(14,165,233,0.14)',
        border: theme.accent,
        stripe: theme.accent,
        title: theme.text,
        text: theme.text,
      },
      muted: {
        bg: theme.card,
        border: theme.cardBorder,
        stripe: theme.primary,
        title: theme.text,
        text: theme.textDim,
      },
    };

    const tone = palette[(action as ToastAction) ?? 'muted'];

    const themedStyle: ViewStyle = {
      marginHorizontal: 12,
      marginVertical: 6,
      borderRadius: 16,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: tone.border,
      backgroundColor: tone.bg,
      paddingHorizontal: 14,
      paddingVertical: 12,
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
      overflow: 'hidden',
    };

    return (
      <Root
        ref={ref}
        className={toastStyle({ variant, action, class: className })}
        context={{
          variant,
          action,
          textColor: textColor ?? tone.text,
          titleColor: titleColor ?? tone.title,
        }}
        style={[themedStyle, style]}
        {...props}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: tone.stripe,
          }}
        />
        {props.children}
      </Root>
    );
  }
);

type IToastTitleProps = React.ComponentProps<typeof Text> & {
  className?: string;
} & VariantProps<typeof toastTitleStyle>;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof Text>,
  IToastTitleProps
>(function ToastTitle({ className, size = 'md', children, style, ...props }, ref) {
  const { titleColor } = useStyleContext(SCOPE) as IToastContext;

  React.useEffect(() => {
    if (typeof children === 'string') {
      AccessibilityInfo.announceForAccessibility(children);
    }
  }, [children]);

  return (
    <Text
      {...props}
      ref={ref}
      aria-live="assertive"
      aria-atomic="true"
      role="alert"
      className={toastTitleStyle({ size, class: className })}
      style={[
        {
          color: titleColor ?? '#FFFFFF',
          fontFamily: Fonts.sans,
          fontSize: 15,
          fontWeight: '800',
          letterSpacing: 0.2,
          marginBottom: 2,
          textTransform: 'capitalize'
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
});

type IToastDescriptionProps = React.ComponentProps<typeof Text> & {
  className?: string;
} & VariantProps<typeof toastDescriptionStyle>;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof Text>,
  IToastDescriptionProps
>(function ToastDescription({ className, size = 'md', style, ...props }, ref) {
  const { textColor } = useStyleContext(SCOPE) as IToastContext;

  return (
    <Text
      ref={ref}
      {...props}
      className={toastDescriptionStyle({ size, class: className })}
      style={[
        {
          color: textColor ?? '#FFFFFF',
          opacity: 0.92,
          fontFamily: Fonts.sans,
          fontSize: 13,
          lineHeight: 18,
        },
        style,
      ]}
    />
  );
});

Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';

type AppToastController = ReturnType<typeof useToast>;

type ShowAppToastOptions = {
  action?: ToastAction;
  title: string;
  description?: string;
  duration?: number;
  placement?: 'top' | 'bottom';
  nativeIDPrefix?: string;
};

function showAppToast(
  toast: AppToastController,
  {
    action = 'muted',
    title,
    description,
    duration = 3500,
    placement = 'bottom',
    nativeIDPrefix = 'toast',
  }: ShowAppToastOptions
) {
  toast.show({
    placement,
    duration,
    render: ({ id }) => (
      <Toast
        nativeID={`${nativeIDPrefix}-${id}`}
        action={action}
        variant="solid"        
      >
        <ToastTitle>{title}</ToastTitle>
        {description ? <ToastDescription numberOfLines={3}>{description}</ToastDescription> : null}
      </Toast>
    ),
  });
}

function resolveToastAction(action?: string): ToastAction {
  switch (action) {
    case 'error':
    case 'warning':
    case 'success':
    case 'info':
    case 'muted':
      return action;
    default:
      return 'muted';
  }
}

export { useToast, Toast, ToastTitle, ToastDescription, showAppToast, resolveToastAction };