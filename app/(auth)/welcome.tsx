import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const { signInDemo } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onDemo() {
    setError('');
    setLoading(true);
    try {
      await signInDemo();
      router.replace('/(app)/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start demo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <FadeIn>
        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(22,163,74,0.18)', 'rgba(228,240,232,0.5)', 'transparent']}
            style={styles.glow}
          />
          <Logo height={96} width={340} />
        </View>
      </FadeIn>

      <FadeIn delay={140} style={styles.actions}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign in" onPress={() => router.push('/(auth)/login')} />
        <Button
          label="Create account"
          variant="secondary"
          onPress={() => router.push('/(auth)/signup')}
        />
        <Button
          label="Continue as Farahnaz (demo)"
          variant="ghost"
          loading={loading}
          onPress={onDemo}
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  glow: {
    position: 'absolute',
    top: -10,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  actions: {
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
  },
});
