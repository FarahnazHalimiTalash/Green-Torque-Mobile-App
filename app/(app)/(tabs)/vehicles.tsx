import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatMileage, vehicleLabel } from '@/lib/format';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function VehiclesScreen() {
  const { vehicles, selectedVehicle, selectVehicle } = useApp();

  return (
    <Screen>
      <Text style={styles.title}>Vehicles</Text>
      <Text style={styles.subtitle}>Add every EV or hybrid you service with Green Torque.</Text>
      <Button label="Add vehicle" onPress={() => router.push('/(app)/vehicle/add')} style={{ marginBottom: 18 }} />
      {vehicles.length === 0 ? (
        <Card>
          <Text style={styles.empty}>No vehicles yet</Text>
          <Text style={styles.subtitle}>Start with VIN, year, make, model, and mileage.</Text>
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {vehicles.map((vehicle) => {
            const selected = selectedVehicle?.id === vehicle.id;
            return (
              <Card key={vehicle.id} onPress={() => router.push(`/(app)/vehicle/${vehicle.id}`)}>
                <Text style={styles.name}>{vehicleLabel(vehicle)}</Text>
                <Text style={styles.meta}>
                  {vehicle.vin || 'VIN not added'} · {formatMileage(vehicle.mileage)}
                </Text>
                <Button
                  label={selected ? 'Selected' : 'Use on home'}
                  variant={selected ? 'secondary' : 'ghost'}
                  onPress={() => selectVehicle(vehicle.id)}
                />
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 18,
    marginTop: 6,
    lineHeight: 20,
  },
  empty: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
  },
});
