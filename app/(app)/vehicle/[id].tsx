import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatMileage, vehicleLabel } from '@/lib/format';
import { resolveVehiclePhoto } from '@/lib/vehicle-photo';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text } from 'react-native';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vehicles, repairOrders, selectVehicle } = useApp();
  const vehicle = vehicles.find((item) => item.id === id);

  if (!vehicle) {
    return (
      <Screen>
        <Text style={styles.missing}>Vehicle not found.</Text>
      </Screen>
    );
  }

  const related = repairOrders.filter((order) => order.vehicleId === vehicle.id);

  return (
    <Screen>
      <Image source={{ uri: resolveVehiclePhoto(vehicle) }} style={styles.hero} />
      <Text style={styles.title}>{vehicleLabel(vehicle)}</Text>
      <Text style={styles.meta}>{vehicle.nickname ?? vehicle.evType.toUpperCase()}</Text>
      <Card>
        <Text style={styles.row}>VIN: {vehicle.vin || 'Not provided'}</Text>
        <Text style={styles.row}>Mileage: {formatMileage(vehicle.mileage)}</Text>
        <Text style={styles.row}>Powertrain: {vehicle.evType.toUpperCase()}</Text>
      </Card>
      <Button label="Book service for this vehicle" onPress={() => {
        selectVehicle(vehicle.id);
        router.push('/(app)/(tabs)/book');
      }} />
      <Text style={styles.section}>Repair history</Text>
      {related.length === 0 ? (
        <Text style={styles.meta}>No repair orders yet.</Text>
      ) : (
        related.map((order) => (
          <Card key={order.id} onPress={() => router.push(`/(app)/repair/${order.id}`)}>
            <Text style={styles.row}>#{order.number} · {order.serviceSummary}</Text>
            <Text style={styles.meta}>{order.status.replaceAll('_', ' ')}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  meta: {
    color: colors.textMuted,
    marginBottom: 16,
    marginTop: 4,
  },
  row: {
    color: colors.text,
    fontSize: 16,
  },
  section: {
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
  },
  missing: {
    color: colors.text,
    marginTop: 24,
  },
});
