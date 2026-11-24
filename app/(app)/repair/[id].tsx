import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EstimateDecisionBox } from '@/components/ui/EstimateDecisionBox';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WorkVideo } from '@/components/ui/WorkVideo';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatDateTime, formatMoney, repairStatusCopy, repairTimeline } from '@/lib/format';
import { shopMediaUrl } from '@/lib/shop-api';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

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
  const diagnosis = order.diagnosisCharge;

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

      {diagnosis?.status === 'sent' ? (
        <Card>
          <Text style={styles.label}>Diagnosis charge</Text>
          <Text style={styles.amount}>{formatMoney(diagnosis.amount)}</Text>
          <Text style={styles.body}>{diagnosis.description || 'Vehicle diagnosis'}</Text>
          <Text style={styles.meta}>
            This is the fee for diagnosing the vehicle after check-in. It still applies if you decline extra repairs.
          </Text>
        </Card>
      ) : null}

      {estimate ? (
        <Card>
          <Text style={styles.label}>Further service estimate</Text>
          <Text style={styles.amount}>{formatMoney(estimate.amount)}</Text>
          {estimate.lines.map((line) => (
            <Text key={line.id} style={styles.meta}>
              {line.name} · {formatMoney(line.amount)}
            </Text>
          ))}
          <EstimateDecisionBox status={estimate.status} />
          {estimate.status === 'sent' ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Button label="Approve estimate" onPress={() => respondToEstimate(order.id, 'approved', estimate.id)} />
              <Button label="Decline estimate" variant="danger" onPress={() => respondToEstimate(order.id, 'declined', estimate.id)} />
            </View>
          ) : null}
        </Card>
      ) : null}

      {(order.foundProblems ?? []).map((problem) => (
        <Card key={problem.id}>
          <Text style={styles.label}>New problem found</Text>
          <Text style={styles.body}>{problem.summary}</Text>
          <Text style={styles.amount}>{formatMoney(problem.estimate.amount)}</Text>
          {problem.estimate.lines.map((line) => (
            <Text key={line.id} style={styles.meta}>
              {line.name} · {formatMoney(line.amount)}
            </Text>
          ))}
          <EstimateDecisionBox status={problem.estimate.status} variant="found_problem" />
          {problem.estimate.status === 'sent' ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Button
                label="Approve extra repair"
                onPress={() => respondToEstimate(order.id, 'approved', problem.estimate.id)}
              />
              <Button
                label="Decline extra repair"
                variant="danger"
                onPress={() => respondToEstimate(order.id, 'declined', problem.estimate.id)}
              />
            </View>
          ) : null}
        </Card>
      ))}

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
          <Text style={styles.label}>Work photos & videos</Text>
          {visibleMedia.map((item) => (
            <View key={item.id} style={styles.media}>
              {item.uri && item.kind === 'video_clip' ? (
                <WorkVideo uri={item.uri} caption={item.caption} />
              ) : item.uri && item.kind === 'photo' ? (
                <>
                  <Image source={{ uri: shopMediaUrl(item.uri) }} style={styles.photo} />
                  {item.caption ? <Text style={styles.body}>{item.caption}</Text> : null}
                </>
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
          <Text style={styles.label}>Work photos & videos</Text>
          <Text style={styles.body}>The shop will post photos and videos here when they record the work on your vehicle.</Text>
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
  photo: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: '#050C09',
  },
  mediaKind: {
    color: colors.primary,
    fontWeight: '700',
  },
});
