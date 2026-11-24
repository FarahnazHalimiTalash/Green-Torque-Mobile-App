import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { repairStatusCopy } from '@/lib/format';
import type { AppointmentStatus, EstimateStatus, RepairStatus } from '@/types';

const tones: Record<string, { bg: string; fg: string }> = {
  checked_in: { bg: colors.primaryMuted, fg: colors.primary },
  diagnosis: { bg: colors.warningMuted, fg: colors.warning },
  in_progress: { bg: colors.warningMuted, fg: colors.warning },
  inspection: { bg: colors.warningMuted, fg: colors.warning },
  ready: { bg: colors.primaryMuted, fg: colors.primary },
  picked_up: { bg: colors.primaryMuted, fg: colors.primary },
  cancelled: { bg: colors.dangerMuted, fg: colors.danger },
  requested: { bg: colors.warningMuted, fg: colors.warning },
  confirmed: { bg: colors.primaryMuted, fg: colors.primary },
  completed: { bg: colors.primaryMuted, fg: colors.primary },
  draft: { bg: colors.bgElevated, fg: colors.textMuted },
  sent: { bg: colors.warningMuted, fg: colors.warning },
  approved: { bg: colors.primaryMuted, fg: colors.primary },
  declined: { bg: colors.dangerMuted, fg: colors.danger },
  expired: { bg: colors.dangerMuted, fg: colors.danger },
};

export function StatusBadge({
  status,
}: {
  status: RepairStatus | AppointmentStatus | EstimateStatus | string;
}) {
  const tone = tones[status] ?? { bg: colors.bgElevated, fg: colors.textMuted };
  const label = repairStatusCopy[status as RepairStatus] ?? humanize(status);
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{label}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
