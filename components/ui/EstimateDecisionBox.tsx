import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import type { Estimate } from '@/types';

const furtherCopy: Record<'sent' | 'approved' | 'declined', { title: string; body: string; tone: 'pending' | 'ok' | 'no' }> = {
  sent: {
    title: 'Waiting for your decision',
    body: 'Approve this further-service estimate to continue the extra repair, or decline if you do not want that work.',
    tone: 'pending',
  },
  approved: {
    title: 'Estimate approved',
    body: 'You accepted this further-service estimate. The shop can continue the additional repair.',
    tone: 'ok',
  },
  declined: {
    title: 'Estimate declined',
    body: 'You declined this further-service estimate. The diagnosis charge still applies. The shop will not do this extra work unless a new estimate is sent.',
    tone: 'no',
  },
};

const foundCopy: Record<'sent' | 'approved' | 'declined', { title: string; body: string; tone: 'pending' | 'ok' | 'no' }> = {
  sent: {
    title: 'New problem found — waiting for your decision',
    body: 'The shop found another issue while working on your vehicle. Approve this estimate to have it repaired, or decline if you do not want that extra work.',
    tone: 'pending',
  },
  approved: {
    title: 'New-problem estimate approved',
    body: 'You accepted the extra repair for this newly found problem. The shop can continue that work.',
    tone: 'ok',
  },
  declined: {
    title: 'New-problem estimate declined',
    body: 'You declined this extra repair. The shop will not do that additional work unless a new estimate is sent.',
    tone: 'no',
  },
};

export function EstimateDecisionBox({
  status,
  variant = 'further',
}: {
  status: Estimate['status'];
  variant?: 'further' | 'found_problem';
}) {
  const copy = variant === 'found_problem' ? foundCopy : furtherCopy;
  const result = copy[status as 'sent' | 'approved' | 'declined'];
  if (!result) return null;

  return (
    <View
      style={[
        styles.box,
        result.tone === 'ok' && styles.ok,
        result.tone === 'no' && styles.no,
        result.tone === 'pending' && styles.pending,
      ]}
    >
      <Text
        style={[
          styles.title,
          result.tone === 'ok' && styles.okText,
          result.tone === 'no' && styles.noText,
          result.tone === 'pending' && styles.pendingText,
        ]}
      >
        {result.title}
      </Text>
      <Text style={styles.body}>{result.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 6,
  },
  pending: {
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
  },
  ok: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  no: {
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
  },
  pendingText: {
    color: colors.warning,
  },
  okText: {
    color: colors.primary,
  },
  noText: {
    color: colors.danger,
  },
  body: {
    color: colors.text,
    lineHeight: 20,
  },
});
