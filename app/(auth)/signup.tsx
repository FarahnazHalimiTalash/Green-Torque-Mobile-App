import { Button } from '@/components/ui/Button';
import { HeaderBack } from '@/components/ui/HeaderBack';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SignupScreen() {
  const { signUp } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError('');
    if (!fullName.trim()) {
      setError('Enter your name.');
      return;
    }
    setLoading(true);
    try {
      await signUp({ fullName, email, phone, password });
      router.replace('/(app)/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <HeaderBack fallback="/(auth)/welcome" style={styles.back} />
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Your vehicles, appointments, and repair updates will live here.</Text>
      <View style={styles.form}>
        <Input label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholder="Farahnaz" />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@email.com" />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(555) 000-0000" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Create account" onPress={onSubmit} loading={loading} />
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
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  error: {
    color: colors.danger,
  },
});
