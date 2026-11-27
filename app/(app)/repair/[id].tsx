import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EstimateDecisionBox } from '@/components/ui/EstimateDecisionBox';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { WorkVideo } from '@/components/ui/WorkVideo';
import { colors, fonts, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { dueChargesForOrder, dueTotal } from '@/lib/billing';
import { formatDateTime, formatMoney } from '@/lib/format';
import { shopMediaUrl } from '@/lib/shop-api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

export default function RepairDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    repairOrders,
    respondToEstimate,
    payments,
    paymentMethods,
    profile,
    submitPickupAcknowledgment,
  } = useApp();
  const [pickupNote, setPickupNote] = useState('');
  const [pickupSignature, setPickupSignature] = useState('');
  const [submittingPickup, setSubmittingPickup] = useState(false);
  const order = repairOrders.find((item) => item.id === id);

  if (!order) {
    return (
      <Screen>
        <Text style={styles.title}>Repair order not found.</Text>
      </Screen>
    );
  }

  const repairOrderId = order.id;
  const closed = order.status === 'picked_up' || order.status === 'cancelled';
  const acknowledgment = order.pickupAcknowledgment;
  const needsPickupSign =
    !acknowledgment && (order.status === 'ready' || order.status === 'picked_up');
  const visibleNotes = order.notes.filter((note) => note.visibleToCustomer);
  const visibleMedia = order.media.filter((item) => item.visibleToCustomer);
  const estimate = order.estimate;
  const diagnosis = order.diagnosisCharge;
  const due = dueChargesForOrder(order, payments);
  const paid = payments.filter((item) => item.repairOrderId === order.id);

  async function submitPickup() {
    setSubmittingPickup(true);
    try {
      await submitPickupAcknowledgment(repairOrderId, pickupNote, pickupSignature);
      setPickupNote('');
      setPickupSignature('');
    } catch (error) {
      Alert.alert('Could not sign', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSubmittingPickup(false);
    }
  }

  return (
    <Screen>
      <StatusBadge status={order.status} />
      <Text style={styles.title}>Repair order #{order.number}</Text>
      <Text style={styles.meta}>
        {order.serviceSummary}
        {order.bayName ? ` · ${order.bayName}` : ''}
      </Text>
      {closed ? (
        <Text style={styles.meta}>View only</Text>
      ) : null}

      <Card>
        <Text style={styles.label}>Status</Text>
        <StatusTimeline status={order.status} />
      </Card>

      {due.length || paid.length ? (
        <Card>
          <View style={styles.row}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Payment</Text>
          </View>
          {due.map((item) => (
            <Text key={item.sourceId} style={styles.body}>
              Due · {item.description} · {formatMoney(item.amount)}
            </Text>
          ))}
          {paid.map((item) => (
            <Text key={item.id} style={styles.meta}>
              Paid {formatMoney(item.amount)} · {item.methodBrand} •••• {item.methodLast4}
            </Text>
          ))}
          {due.length ? (
            <Button
              label={
                paymentMethods.length
                  ? `Pay ${formatMoney(dueTotal(due))}`
                  : 'Add a payment method to pay'
              }
              onPress={() => router.push('/(app)/payments')}
            />
          ) : null}
        </Card>
      ) : null}

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
          {!closed && estimate.status === 'sent' ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Button label="Approve estimate" onPress={() => respondToEstimate(order.id, 'approved', estimate.id)} />
              <Button label="Decline estimate" variant="danger" onPress={() => respondToEstimate(order.id, 'declined', estimate.id)} />
            </View>
          ) : null}
        </Card>
      ) : null}

      {(order.foundProblems ?? []).map((problem) => (
        <Card key={problem.id}>
          <View style={styles.row}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
            <Text style={styles.label}>New problem found</Text>
          </View>
          <Text style={styles.body}>{problem.summary}</Text>
          <Text style={styles.amount}>{formatMoney(problem.estimate.amount)}</Text>
          {problem.estimate.lines.map((line) => (
            <Text key={line.id} style={styles.meta}>
              {line.name} · {formatMoney(line.amount)}
            </Text>
          ))}
          <EstimateDecisionBox status={problem.estimate.status} variant="found_problem" />
          {!closed && problem.estimate.status === 'sent' ? (
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

      {needsPickupSign ? (
        <Card>
          <View style={styles.row}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Pickup acknowledgment</Text>
          </View>
          <Text style={styles.body}>
            When work is done, confirm you received your vehicle and that it is alright. Your note
            and full-name signature are locked after you send them.
          </Text>
          <Input
            label="Note"
            value={pickupNote}
            onChangeText={setPickupNote}
            placeholder="I received my vehicle and everything looks alright."
            multiline
            autoCapitalize="sentences"
          />
          <Input
            label="Signature (full name)"
            value={pickupSignature}
            onChangeText={setPickupSignature}
            placeholder={profile?.fullName ?? 'Type your full name'}
            autoCapitalize="words"
          />
          <Text style={styles.meta}>
            Signature must match your account name{profile?.fullName ? `: ${profile.fullName}` : ''}.
          </Text>
          <Button
            label="Sign and confirm pickup"
            onPress={submitPickup}
            loading={submittingPickup}
            disabled={!pickupNote.trim() || !pickupSignature.trim()}
          />
        </Card>
      ) : null}

      {acknowledgment ? (
        <Card>
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Signed pickup record</Text>
          </View>
          <Text style={styles.body}>{acknowledgment.note}</Text>
          <Text style={styles.signature}>{acknowledgment.signatureFullName}</Text>
          <Text style={styles.meta}>
            Signed {formatDateTime(acknowledgment.signedAt)} · Locked — not editable
          </Text>
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
    fontSize: 28,
    fontFamily: fonts.display,
    letterSpacing: -0.5,
    marginTop: 12,
  },
  meta: {
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.body,
  },
  label: {
    color: colors.primaryDark,
    fontFamily: fonts.caption,
    letterSpacing: 0.8,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  amount: {
    color: colors.text,
    fontSize: 28,
    fontFamily: fonts.display,
  },
  body: {
    color: colors.text,
    lineHeight: 22,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  media: {
    gap: 4,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
  mediaKind: {
    color: colors.primaryDeep,
    fontFamily: fonts.bodyBold,
  },
  signature: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.displayMedium,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
