import { Button } from '@/components/ui/Button';
import { HeaderBack } from '@/components/ui/HeaderBack';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(app)/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <HeaderBack fallback="/(auth)/welcome" style={styles.back} />
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Use your Green Torque customer account.</Text>
      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign in" onPress={onSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    marginTop: 4,
    marginBottom: 12,
    marginLeft: -8,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
  error: {
    color: colors.danger,
  },
});
