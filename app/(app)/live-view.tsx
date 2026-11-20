import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatDateTime } from '@/lib/format';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function LiveViewScreen() {
  const { activeRepair } = useApp();
  const clip = activeRepair?.media.find((item) => item.kind === 'video_clip' && item.visibleToCustomer);

  return (
    <Screen>
      <Card>
        <Text style={styles.kicker}>AUTHORIZED VIEW</Text>
        <Text style={styles.title}>
          {activeRepair ? `${activeRepair.bayName ?? 'Shop bay'} · ${activeRepair.cameraName ?? 'Assigned camera'}` : 'No active camera'}
        </Text>
        <Text style={styles.body}>
          Live camera access is only available while your vehicle is in diagnosis or repair, and only for the bay assigned to your repair order. Access expires automatically at pickup.
        </Text>
      </Card>

      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Live view is not enabled</Text>
        <Text style={styles.previewBody}>
          When a technician turns on live viewing for Bay {activeRepair?.bayName?.replace('Bay ', '') ?? '—'}, a secure stream will appear here.
        </Text>
      </View>

      {clip ? (
        <Card>
          <Text style={styles.kicker}>RECORDED UPDATE</Text>
          <Text style={styles.title}>32-second technician clip</Text>
          <Text style={styles.body}>{clip.caption}</Text>
          <Text style={styles.meta}>{formatDateTime(clip.createdAt)}</Text>
        </Card>
      ) : (
        <Card>
          <Text style={styles.title}>No recorded clips yet</Text>
          <Text style={styles.body}>You’ll get a notification when the technician posts a video update.</Text>
        </Card>
      )}

      {activeRepair ? (
        <Button label="Open repair details" onPress={() => router.push(`/(app)/repair/${activeRepair.id}`)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  meta: {
    color: colors.textDim,
  },
  preview: {
    minHeight: 180,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#050C09',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginVertical: 16,
    gap: 8,
  },
  previewTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  previewBody: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
