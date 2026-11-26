import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radius, spacing, type } from '@/constants/theme';
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
    <Screen variant="hero" style={styles.screen}>
      <FadeIn>
        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(34,197,94,0.18)', 'rgba(255,255,255,0.04)', 'transparent']}
            style={styles.glow}
          />
          <Logo height={88} width={320} clear />
          <Text style={styles.brand}>Green Torque</Text>
          <Text style={styles.tagline}>Hybrid & EV repair, tracked in one place.</Text>
        </View>
      </FadeIn>

      <FadeIn delay={120} style={styles.actions}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign in" onPress={() => router.push('/(auth)/login')} />
        <Button
          label="Create account"
          variant="secondary"
          onPress={() => router.push('/(auth)/signup')}
          style={styles.secondaryOnDark}
        />
        <Button
          label="Continue as Farahnaz (demo)"
          variant="ghost"
          loading={loading}
          onPress={onDemo}
          style={styles.ghostOnDark}
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
    paddingTop: 36,
    paddingBottom: 28,
    gap: 14,
  },
  glow: {
    position: 'absolute',
    top: -20,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  brand: {
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: type.hero,
    letterSpacing: -0.8,
  },
  tagline: {
    color: 'rgba(242,251,246,0.78)',
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: {
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryOnDark: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  ghostOnDark: {
    // ghost label still uses primaryDeep; fine on dark with light panel
  },
  error: {
    color: '#FCA5A5',
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
  },
});
