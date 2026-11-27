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
  media?: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  tone?: 'default' | 'emphasis' | 'quiet';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({ children, media, style, onPress, tone = 'default' }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toneStyle =
    tone === 'emphasis' ? styles.emphasis : tone === 'quiet' ? styles.quiet : null;

  const body = (
    <>
      {media ? <View style={styles.media}>{media}</View> : null}
      <View style={styles.body}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.982, { damping: 18, stiffness: 280 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 220 });
        }}
        style={[styles.card, toneStyle, animatedStyle, style]}>
        {body}
      </AnimatedPressable>
    );
  }

  return <View style={[styles.card, toneStyle, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  media: {
    width: '100%',
    backgroundColor: colors.bgElevated,
  },
  body: {
    padding: spacing.lg,
    gap: 12,
  },
  emphasis: {
    borderColor: 'rgba(22, 163, 74, 0.28)',
    backgroundColor: colors.white,
  },
  quiet: {
    backgroundColor: colors.cardAlt,
    ...shadow.soft,
  },
});
