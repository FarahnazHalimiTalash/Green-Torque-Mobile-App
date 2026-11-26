import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients, spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  includeTopInset?: boolean;
  variant?: 'default' | 'hero';
};

export function Screen({
  children,
  scroll = true,
  style,
  includeTopInset = true,
  variant = 'default',
}: Props) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, style]}>{children}</View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={includeTopInset ? ['top', 'left', 'right'] : ['left', 'right']}>
      <LinearGradient
        colors={variant === 'hero' ? [...gradients.hero] : [...gradients.screen]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}>
        <View style={styles.atmosphere} pointerEvents="none" />
        <View style={styles.shell}>{body}</View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gradient: {
    flex: 1,
  },
  atmosphere: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryGlow,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
  },
  fill: {
    flex: 1,
  },
});
