import { colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

type Props = {
  fallback?: Href;
  color?: string;
  style?: ViewStyle;
};

export function HeaderBack({
  fallback = '/(app)/(tabs)',
  color = colors.primary,
  style,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace(fallback);
      }}
      style={[styles.hit, style]}>
      <Ionicons name="chevron-back" size={26} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
