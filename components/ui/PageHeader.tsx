import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing, type } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function PageHeader({ title, subtitle, eyebrow }: Props) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    gap: 8,
  },
  eyebrow: {
    color: colors.primaryDeep,
    fontFamily: fonts.caption,
    fontSize: type.overline,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: type.hero,
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: type.body,
    lineHeight: 23,
    maxWidth: 340,
  },
});
