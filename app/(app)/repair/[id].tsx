import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WorkVideo } from '@/components/ui/WorkVideo';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatDateTime, formatMoney, repairStatusCopy, repairTimeline } from '@/lib/format';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function RepairDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repairOrders, respondToEstimate } = useApp();
  const order = repairOrders.find((item) => item.id === id);

  if (!order) {
    return (
      <Screen>
        <Text style={styles.title}>Repair order not found.</Text>
      </Screen>
    );
  }

  const currentIndex = repairTimeline.indexOf(order.status as (typeof repairTimeline)[number]);
  const visibleNotes = order.notes.filter((note) => note.visibleToCustomer);
  const visibleMedia = order.media.filter((item) => item.visibleToCustomer);
  const estimate = order.estimate;

  return (
    <Screen>
      <StatusBadge status={order.status} />
      <Text style={styles.title}>Repair order #{order.number}</Text>
      <Text style={styles.meta}>
        {order.serviceSummary}
        {order.bayName ? ` · ${order.bayName}` : ''}
      </Text>

      <Card>
        {repairTimeline.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, index <= currentIndex && styles.dotOn]} />
            <Text style={[styles.stepText, index === currentIndex && styles.current]}>
              {repairStatusCopy[step]}
            </Text>
          </View>
        ))}
      </Card>

      {estimate ? (
        <Card>
          <Text style={styles.label}>Estimate</Text>
          <Text style={styles.amount}>{formatMoney(estimate.amount)}</Text>
          {estimate.lines.map((line) => (
            <Text key={line.id} style={styles.meta}>
              {line.name} · {formatMoney(line.amount)}
            </Text>
          ))}
          <StatusBadge status={estimate.status} />
          {estimate.status === 'sent' ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Button label="Approve estimate" onPress={() => respondToEstimate(order.id, 'approved')} />
              <Button label="Decline estimate" variant="danger" onPress={() => respondToEstimate(order.id, 'declined')} />
            </View>
          ) : null}
        </Card>
      ) : null}

      {visibleNotes.length ? (
        <Card>
          <Text style={styles.label}>Shop notes</Text>
          {visibleNotes.map((note) => (
            <View key={note.id}>
              <Text style={styles.body}>{note.body}</Text>
              <Text style={styles.meta}>{formatDateTime(note.createdAt)}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      {visibleMedia.length ? (
        <Card>
          <Text style={styles.label}>Work videos</Text>
          {visibleMedia.map((item) => (
            <View key={item.id} style={styles.media}>
              {item.uri ? (
                <WorkVideo uri={item.uri} caption={item.caption} />
              ) : (
                <>
                  <Text style={styles.mediaKind}>
                    {item.kind === 'video_clip' ? 'Video update' : item.kind.replaceAll('_', ' ')}
                  </Text>
                  <Text style={styles.body}>{item.caption}</Text>
                </>
              )}
              <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={styles.label}>Work videos</Text>
          <Text style={styles.body}>The shop will post a video here when they record the work on your vehicle.</Text>
        </Card>
      )}

      <Button label="Message shop" variant="ghost" onPress={() => router.push('/(app)/messages')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 12,
  },
  meta: {
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 4,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotOn: {
    backgroundColor: colors.primary,
  },
  stepText: {
    color: colors.textDim,
  },
  current: {
    color: colors.warning,
    fontWeight: '800',
  },
  label: {
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  amount: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  body: {
    color: colors.text,
    lineHeight: 22,
  },
  media: {
    gap: 4,
  },
  mediaKind: {
    color: colors.primary,
    fontWeight: '700',
  },
});
