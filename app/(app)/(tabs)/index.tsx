import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EstimateDecisionBox } from '@/components/ui/EstimateDecisionBox';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatMileage, formatMoney, vehicleLabel } from '@/lib/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { profile, selectedVehicle, activeRepair, signOut, liveWithShop } = useApp();
  const firstName = profile?.fullName.split(' ')[0] ?? 'there';

  return (
    <Screen includeTopInset={false}>
      <Text style={styles.hello}>Hello, {firstName}</Text>
      {liveWithShop ? <Text style={styles.live}>Live with shop</Text> : null}

      {selectedVehicle ? (
        <Card onPress={() => router.push(`/(app)/vehicle/${selectedVehicle.id}`)}>
          <View style={styles.vehicleRow}>
            {selectedVehicle.photoUrl ? (
              <Image source={{ uri: selectedVehicle.photoUrl }} style={styles.vehiclePhoto} />
            ) : (
              <View style={styles.vehiclePhotoFallback}>
                <Ionicons name="car-sport" size={22} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleKicker}>VEHICLE</Text>
              <Text style={styles.vehicleName}>{vehicleLabel(selectedVehicle)}</Text>
              <Text style={styles.muted}>{formatMileage(selectedVehicle.mileage)}</Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card>
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
            {activeRepair.diagnosisCharge?.status === 'sent'
              ? ` · Diagnosis ${formatMoney(activeRepair.diagnosisCharge.amount)}`
              : ''}
          </Text>
          {activeRepair.estimate ? <EstimateDecisionBox status={activeRepair.estimate.status} /> : null}
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

      <SectionHeader title="APPOINTMENTS" />
      <Button label="+ Book appointment" onPress={() => router.push('/(app)/(tabs)/book')} />

      <SectionHeader title="HISTORY" />
      <Button
        label="View service history"
        variant="secondary"
        onPress={() => router.push('/(app)/(tabs)/history')}
      />

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
    fontSize: 12,
    fontWeight: '700',
  },
  hello: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  vehiclePhoto: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
  },
  vehiclePhotoFallback: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleKicker: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  vehicleName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  muted: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  repairTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
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
