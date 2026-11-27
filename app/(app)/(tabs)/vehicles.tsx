import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHeader } from '@/components/ui/PageHeader';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatVehicleIdentity, vehicleLabel } from '@/lib/format';
import { resolveVehiclePhoto } from '@/lib/vehicle-photo';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function VehiclesScreen() {
  const { vehicles, selectedVehicle, selectVehicle } = useApp();

  return (
    <Screen includeTopInset={false}>
      <FadeIn>
        <PageHeader title="Vehicles" />
        <Button label="Add vehicle" onPress={() => router.push('/(app)/vehicle/add')} style={{ marginBottom: 8 }} />
      </FadeIn>

      {vehicles.length === 0 ? (
        <FadeIn delay={80}>
          <Card>
            <Text style={styles.empty}>No vehicles yet</Text>
          </Card>
        </FadeIn>
      ) : (
        <View style={{ gap: 16 }}>
          {vehicles.map((vehicle, index) => {
            const selected = selectedVehicle?.id === vehicle.id;
            return (
              <FadeIn key={vehicle.id} delay={70 + index * 55}>
                <Card
                  onPress={() => router.push(`/(app)/vehicle/${vehicle.id}`)}
                  tone={selected ? 'emphasis' : 'default'}
                  media={
                    <Image source={{ uri: resolveVehiclePhoto(vehicle) }} style={styles.hero} />
                  }>
                  <Text style={styles.name}>{vehicleLabel(vehicle)}</Text>
                  <Text style={styles.meta}>{formatVehicleIdentity(vehicle)}</Text>
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
    letterSpacing: -0.35,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  hero: {
    width: '100%',
    height: 178,
  },
});
