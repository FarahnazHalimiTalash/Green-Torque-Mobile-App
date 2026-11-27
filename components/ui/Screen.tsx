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
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={styles.gradient}>
        <View style={styles.orbTop} pointerEvents="none" />
        <View style={styles.orbBottom} pointerEvents="none" />
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
  orbTop: {
    position: 'absolute',
    top: -100,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primaryGlow,
  },
  orbBottom: {
    position: 'absolute',
    bottom: 80,
    left: -90,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
  },
  fill: {
    flex: 1,
  },
});
