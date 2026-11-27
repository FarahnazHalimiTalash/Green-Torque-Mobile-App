import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EstimateDecisionBox } from '@/components/ui/EstimateDecisionBox';
import { FadeIn } from '@/components/ui/FadeIn';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { VehiclePhoto } from '@/components/ui/VehiclePhoto';
import { colors, fonts, radius, spacing, type } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { dueChargesForOrder, dueTotal } from '@/lib/billing';
import { paymentMethodLabel } from '@/lib/card';
import { formatMoney, formatVehicleIdentity, vehicleLabel } from '@/lib/format';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { profile, selectedVehicle, activeRepair, signOut, liveWithShop, paymentMethods, payments } =
    useApp();
  const due = activeRepair ? dueChargesForOrder(activeRepair, payments) : [];
  const card = paymentMethods[0];
  const firstName = profile?.fullName.split(' ')[0] ?? 'there';

  return (
    <Screen includeTopInset={false}>
      <FadeIn>
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Hello, {firstName}</Text>
          </View>
          {liveWithShop ? (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          ) : null}
        </View>
      </FadeIn>

      <FadeIn delay={70}>
        {selectedVehicle ? (
          <Card
            tone="emphasis"
            onPress={() => router.push(`/(app)/vehicle/${selectedVehicle.id}`)}
            media={<VehiclePhoto vehicle={selectedVehicle} height={200} />}>
            <View style={styles.vehicleRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.vehicleName}>{vehicleLabel(selectedVehicle)}</Text>
                <Text style={styles.muted}>{formatVehicleIdentity(selectedVehicle)}</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card tone="emphasis">
            <Text style={styles.vehicleName}>Add a vehicle</Text>
            <Button label="Add vehicle" onPress={() => router.push('/(app)/vehicle/add')} />
          </Card>
        )}
      </FadeIn>

      <FadeIn delay={130}>
        <SectionHeader title="Current service" />
        {activeRepair ? (
          <Card>
            <StatusBadge status={activeRepair.status} />
            <Text style={styles.repairTitle}>{activeRepair.serviceSummary}</Text>
            <Text style={styles.muted}>
              RO #{activeRepair.number}
              {activeRepair.bayName ? ` · ${activeRepair.bayName}` : ''}
            </Text>
            <StatusTimeline status={activeRepair.status} />
            {(activeRepair.foundProblems ?? [])
              .filter((item) => item.estimate.status === 'sent')
              .map((item) => (
                <EstimateDecisionBox key={item.id} status={item.estimate.status} variant="found_problem" />
              ))}
            {activeRepair.estimate?.status === 'sent' ? (
              <EstimateDecisionBox status={activeRepair.estimate.status} />
            ) : null}
            <Button
              label="Repair details"
              onPress={() => router.push(`/(app)/repair/${activeRepair.id}`)}
            />
            <Button label="Message shop" variant="ghost" onPress={() => router.push('/(app)/messages')} />
          </Card>
        ) : (
          <Card tone="quiet">
            <Text style={styles.vehicleName}>No active service</Text>
            <Button label="Book appointment" onPress={() => router.push('/(app)/(tabs)/book')} />
          </Card>
        )}
      </FadeIn>

      <FadeIn delay={190}>
        <SectionHeader title="Payment" />
        <Card onPress={() => router.push('/(app)/payments')}>
          <View style={{ gap: 2 }}>
            <Text style={styles.vehicleName}>
              {card ? paymentMethodLabel(card) : 'Add a payment method'}
            </Text>
            {due.length && activeRepair ? (
              <Text style={styles.muted}>
                {formatMoney(dueTotal(due))} due on RO #{activeRepair.number}
              </Text>
            ) : null}
          </View>
        </Card>
      </FadeIn>

      <Pressable onPress={signOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  hello: {
    color: colors.text,
    fontSize: type.hero,
    fontFamily: fonts.display,
    letterSpacing: -0.9,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveText: {
    color: colors.primaryDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vehicleName: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.displayMedium,
    letterSpacing: -0.35,
  },
  muted: {
    color: colors.textMuted,
    lineHeight: 21,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  repairTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.display,
    letterSpacing: -0.45,
  },
  signOut: {
    alignItems: 'center',
    marginTop: 28,
  },
  signOutText: {
    color: colors.textDim,
    fontFamily: fonts.bodyMedium,
  },
});
