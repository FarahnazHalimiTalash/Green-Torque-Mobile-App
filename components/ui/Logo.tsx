import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function Logo({ size = 76 }: { size?: number }) {
  return (
    <LinearGradient
      colors={['#6AF3A7', '#1FA85A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}>
      <Text style={[styles.letters, { fontSize: size * 0.32 }]}>GT</Text>
      <View style={[styles.bolt, { width: size * 0.18, height: 3 }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letters: {
    color: colors.bg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bolt: {
    marginTop: 2,
    backgroundColor: colors.bg,
    borderRadius: 2,
  },
});
