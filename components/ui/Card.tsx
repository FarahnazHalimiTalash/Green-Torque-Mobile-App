import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, radius, shadow, spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  tone?: 'default' | 'emphasis' | 'quiet';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({ children, style, onPress, tone = 'default' }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toneStyle =
    tone === 'emphasis' ? styles.emphasis : tone === 'quiet' ? styles.quiet : null;

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.985, { damping: 18, stiffness: 280 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 220 });
        }}
        style={[styles.card, toneStyle, animatedStyle, style]}>
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[styles.card, toneStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 12,
    ...shadow.card,
  },
  emphasis: {
    borderColor: colors.primaryGlow,
    backgroundColor: colors.white,
  },
  quiet: {
    backgroundColor: colors.cardAlt,
    ...shadow.soft,
  },
});
