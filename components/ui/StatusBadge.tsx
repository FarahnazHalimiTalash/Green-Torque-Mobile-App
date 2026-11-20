import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { repairStatusCopy } from '@/lib/format';
import type { AppointmentStatus, EstimateStatus, RepairStatus } from '@/types';

const repairTone: Record<RepairStatus, { bg: string; fg: string }> = {
  checked_in: { bg: colors.infoMuted, fg: colors.info },
  diagnosis: { bg: colors.warningMuted, fg: colors.warning },
  in_progress: { bg: colors.warningMuted, fg: colors.warning },
  inspection: { bg: colors.infoMuted, fg: colors.info },
  ready: { bg: colors.primaryMuted, fg: colors.primary },
  picked_up: { bg: colors.primaryMuted, fg: colors.primary },
  cancelled: { bg: colors.dangerMuted, fg: colors.danger },
};

export function StatusBadge({
  status,
}: {
  status: RepairStatus | AppointmentStatus | EstimateStatus | string;
}) {
  const repair = repairTone[status as RepairStatus];
  const label = repairStatusCopy[status as RepairStatus] ?? humanize(status);
  return (
    <View style={[styles.badge, { backgroundColor: repair?.bg ?? colors.primaryMuted }]}>
      <Text style={[styles.label, { color: repair?.fg ?? colors.primary }]}>{label}</Text>
    </View>
  );
}

function humanize(value: string) {
  return value.replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
