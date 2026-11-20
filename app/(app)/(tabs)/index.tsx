import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatMileage, vehicleLabel } from '@/lib/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { profile, selectedVehicle, activeRepair, unreadCount, signOut, liveWithShop } = useApp();
  const firstName = profile?.fullName.split(' ')[0] ?? 'there';

  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <Text style={styles.brand}>GREEN TORQUE</Text>
          <Text style={styles.shop}>Hybrid & EV Repair</Text>
          {liveWithShop ? <Text style={styles.live}>Live with shop</Text> : null}
        </View>
        <Pressable style={styles.bell} onPress={() => router.push('/(app)/notifications')}>
          <Ionicons name="notifications" size={20} color={colors.text} />
          {unreadCount > 0 ? (
            <View style={styles.dot}>
              <Text style={styles.dotText}>{unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Text style={styles.hello}>Hello, {firstName}</Text>

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
          </Text>
          <Button
            label="View vehicle"
            variant="secondary"
            onPress={() => router.push('/(app)/live-view')}
          />
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
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  brand: {
    color: colors.primary,
    letterSpacing: 2.4,
    fontWeight: '800',
    fontSize: 12,
  },
  shop: {
    color: colors.textMuted,
    marginTop: 2,
  },
  live: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  dotText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  hello: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.lg,
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
