import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
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
    <Screen>
      <View style={styles.hero}>
        <Logo />
        <Text style={styles.kicker}>GREEN TORQUE</Text>
        <Text style={styles.title}>Hybrid & EV Repair</Text>
        <Text style={styles.subtitle}>
          Book service, follow repair progress, and stay connected with the shop — from drop-off to pickup.
        </Text>
      </View>

      <View style={styles.actions}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign in" onPress={() => router.push('/(auth)/login')} />
        <Button label="Create account" variant="secondary" onPress={() => router.push('/(auth)/signup')} />
        <Button
          label="Continue as Farahnaz (demo)"
          variant="ghost"
          loading={loading}
          onPress={onDemo}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 48,
    gap: 10,
  },
  kicker: {
    marginTop: spacing.md,
    color: colors.primary,
    letterSpacing: 3,
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 340,
  },
  actions: {
    gap: 12,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});
