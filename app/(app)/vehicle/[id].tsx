import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts, type } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatVehicleIdentity, vehicleLabel } from '@/lib/format';
import { VehiclePhoto } from '@/components/ui/VehiclePhoto';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

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
      <FadeIn>
        <Card
          media={<VehiclePhoto vehicle={vehicle} height={210} />}>
          <Text style={styles.title}>{vehicleLabel(vehicle)}</Text>
          <Text style={styles.meta}>{formatVehicleIdentity(vehicle)}</Text>
          <Button
            label="Book service"
            onPress={() => {
              selectVehicle(vehicle.id);
              router.push('/(app)/(tabs)/book');
            }}
          />
        </Card>
      </FadeIn>

      <Text style={styles.section}>History</Text>
      {related.length === 0 ? (
        <Text style={styles.meta}>No repairs yet</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {related.map((order) => (
            <Card key={order.id} onPress={() => router.push(`/(app)/repair/${order.id}`)}>
              <Text style={styles.row}>
                #{order.number} · {order.serviceSummary}
              </Text>
              <Text style={styles.meta}>{order.status.replaceAll('_', ' ')}</Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.display,
    letterSpacing: -0.5,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  row: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
  },
  section: {
    color: colors.textDim,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: 11,
    marginTop: 28,
    marginBottom: 12,
  },
  missing: {
    color: colors.text,
    marginTop: 24,
    fontFamily: fonts.displayMedium,
  },
});
