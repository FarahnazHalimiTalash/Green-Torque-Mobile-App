import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, fonts, gradients, radius, shadow } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const spinner =
    variant === 'primary' ? colors.white : variant === 'danger' ? colors.danger : colors.primary;

  const content = loading ? (
    <ActivityIndicator color={spinner} />
  ) : (
    <Text
      style={[
        styles.label,
        variant === 'primary' && styles.primaryLabel,
        variant === 'secondary' && styles.secondaryLabel,
        variant === 'ghost' && styles.ghostLabel,
        variant === 'danger' && styles.dangerLabel,
      ]}>
      {label}
    </Text>
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 240 });
      }}
      style={[
        styles.base,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        variant === 'primary' && styles.primaryShadow,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={[...gradients.primaryButton]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 54,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryShadow: {
    ...shadow.float,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 18,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: 18,
  },
  danger: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 18,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.text,
  },
  ghostLabel: {
    color: colors.primaryDeep,
  },
  dangerLabel: {
    color: colors.danger,
  },
});
