import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHeader } from '@/components/ui/PageHeader';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatMileage, vehicleLabel } from '@/lib/format';
import { resolveVehiclePhoto } from '@/lib/vehicle-photo';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function VehiclesScreen() {
  const { vehicles, selectedVehicle, selectVehicle } = useApp();

  return (
    <Screen includeTopInset={false}>
      <FadeIn>
        <PageHeader
          eyebrow="Garage"
          title="Vehicles"
          subtitle="Add every EV or hybrid you service with Green Torque."
        />
        <Button label="Add vehicle" onPress={() => router.push('/(app)/vehicle/add')} style={{ marginBottom: 8 }} />
      </FadeIn>

      {vehicles.length === 0 ? (
        <FadeIn delay={80}>
          <Card>
            <Text style={styles.empty}>No vehicles yet</Text>
            <Text style={styles.meta}>Start with VIN, year, make, model, and mileage.</Text>
          </Card>
        </FadeIn>
      ) : (
        <View style={{ gap: 14 }}>
          {vehicles.map((vehicle, index) => {
            const selected = selectedVehicle?.id === vehicle.id;
            return (
              <FadeIn key={vehicle.id} delay={80 + index * 60}>
                <Card
                  onPress={() => router.push(`/(app)/vehicle/${vehicle.id}`)}
                  tone={selected ? 'emphasis' : 'default'}>
                  <Image
                    source={{ uri: resolveVehiclePhoto(vehicle) }}
                    style={styles.hero}
                  />
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
              </FadeIn>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.displayMedium,
  },
  name: {
    color: colors.text,
    fontSize: 21,
    fontFamily: fonts.displayMedium,
    letterSpacing: -0.3,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fonts.body,
    lineHeight: 21,
  },
  hero: {
    width: '100%',
    height: 156,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
});
