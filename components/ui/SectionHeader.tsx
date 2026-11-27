import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, type } from '@/constants/theme';

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 22,
  },
  title: {
    color: colors.textDim,
    fontSize: type.overline,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  action: {
    color: colors.primaryDeep,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
});
