import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { repairStatusCopy, repairTimeline } from '@/lib/format';
import type { RepairStatus } from '@/types';

export function StatusTimeline({ status }: { status: RepairStatus }) {
  const currentIndex = repairTimeline.indexOf(status as (typeof repairTimeline)[number]);

  return (
    <View style={styles.wrap}>
      {repairTimeline.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <View key={step} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  current && styles.dotCurrent,
                ]}
              />
              {index < repairTimeline.length - 1 ? (
                <View style={[styles.line, index < currentIndex && styles.lineDone]} />
              ) : null}
            </View>
            <Text style={[styles.label, done && styles.labelDone, current && styles.labelCurrent]}>
              {repairStatusCopy[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 36,
  },
  rail: {
    width: 18,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginTop: 2,
  },
  dotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotCurrent: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  lineDone: {
    backgroundColor: colors.primary,
  },
  label: {
    flex: 1,
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 20,
    paddingBottom: 12,
    fontFamily: fonts.body,
  },
  labelDone: {
    color: colors.textMuted,
  },
  labelCurrent: {
    color: colors.warning,
    fontFamily: fonts.bodyBold,
  },
});
