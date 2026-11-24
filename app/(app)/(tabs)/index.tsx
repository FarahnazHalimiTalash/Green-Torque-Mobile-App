import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EstimateDecisionBox } from '@/components/ui/EstimateDecisionBox';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { dueChargesForOrder, dueTotal } from '@/lib/billing';
import { paymentMethodLabel } from '@/lib/card';
import { formatMileage, formatMoney, vehicleLabel } from '@/lib/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { profile, selectedVehicle, activeRepair, signOut, liveWithShop, paymentMethods, payments } = useApp();
  const due = activeRepair ? dueChargesForOrder(activeRepair, payments) : [];
  const card = paymentMethods[0];
  const firstName = profile?.fullName.split(' ')[0] ?? 'there';

  return (
    <Screen includeTopInset={false}>
      <Text style={styles.hello}>Hello, {firstName}</Text>
      {liveWithShop ? <Text style={styles.live}>Live with shop</Text> : null}

      {selectedVehicle ? (
        <Card onPress={() => router.push(`/(app)/vehicle/${selectedVehicle.id}`)} style={styles.vehicleCard}>
          {selectedVehicle.photoUrl ? (
            <Image source={{ uri: selectedVehicle.photoUrl }} style={styles.vehicleHero} />
          ) : (
            <View style={styles.vehicleHeroFallback}>
              <Ionicons name="car-sport" size={56} color={colors.primary} />
            </View>
          )}
          <Text style={styles.vehicleKicker}>YOUR VEHICLE</Text>
          <Text style={styles.vehicleName}>{vehicleLabel(selectedVehicle)}</Text>
          <Text style={styles.muted}>{formatMileage(selectedVehicle.mileage)}</Text>
        </Card>
      ) : (
        <Card>
          <View style={styles.vehicleHeroFallback}>
            <Ionicons name="car-sport-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.vehicleName}>Add your first vehicle</Text>
          <Text style={styles.muted}>VIN, year, make, model, and mileage.</Text>
          <Button label="Add vehicle" onPress={() => router.push('/(app)/vehicle/add')} />
        </Card>
      )}

      <SectionHeader title="CURRENT SERVICE" />
      {activeRepair ? (
        <Card>
          <StatusBadge status={activeRepair.status} />
          <Text style={styles.repairTitle}>{activeRepair.serviceSummary}</Text>
          <Text style={styles.muted}>
            Repair Order #{activeRepair.number}
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
        <Card>
          <Text style={styles.vehicleName}>No active service</Text>
          <Text style={styles.muted}>Book a drop-off and we’ll keep this card updated.</Text>
        </Card>
      )}

      <SectionHeader title="PAYMENT" />
      <Card onPress={() => router.push('/(app)/payments')}>
        <View style={styles.row}>
          <Ionicons name="card-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleKicker}>PAYMENT METHOD</Text>
            <Text style={styles.vehicleName}>{card ? paymentMethodLabel(card) : 'Add a payment method'}</Text>
            <Text style={styles.muted}>
              {due.length && activeRepair
                ? `${formatMoney(dueTotal(due))} due on repair #${activeRepair.number}`
                : 'Pay diagnosis and approved extra work from here.'}
            </Text>
          </View>
        </View>
        <Button label={card ? 'Manage payment' : 'Add payment method'} onPress={() => router.push('/(app)/payments')} />
      </Card>

      <SectionHeader title="QUICK ACTIONS" />
      <View style={styles.actions}>
        <Button label="Book appointment" onPress={() => router.push('/(app)/(tabs)/book')} />
        <Button
          label="Service history"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/history')}
        />
      </View>

      <Pressable onPress={signOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  live: {
    color: colors.primary,
    marginTop: 2,
    marginBottom: spacing.md,
    fontSize: 13,
    fontWeight: '700',
  },
  hello: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  vehicleCard: {
    overflow: 'hidden',
    paddingTop: spacing.md,
  },
  vehicleHero: {
    width: '100%',
    height: 170,
    borderRadius: radius.md,
    marginBottom: 8,
    backgroundColor: colors.bgElevated,
  },
  vehicleHeroFallback: {
    width: '100%',
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vehicleKicker: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  vehicleName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  muted: {
    color: colors.textMuted,
    lineHeight: 21,
    fontSize: 15,
  },
  repairTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  actions: {
    gap: 10,
  },
  signOut: {
    alignItems: 'center',
    marginTop: 28,
  },
  signOutText: {
    color: colors.textDim,
    fontWeight: '600',
  },
});
