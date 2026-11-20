import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
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
        <Logo height={96} width={360} clear />
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
    paddingTop: 48,
    paddingBottom: 48,
  },
  actions: {
    gap: 12,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});
