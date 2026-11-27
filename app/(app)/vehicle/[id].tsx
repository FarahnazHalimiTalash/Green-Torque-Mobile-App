import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { VehiclePhoto } from '@/components/ui/VehiclePhoto';
import { colors, fonts, type } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatVehicleIdentity, vehicleLabel } from '@/lib/format';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vehicles, repairOrders, selectVehicle, updateVehicle } = useApp();
  const vehicle = vehicles.find((item) => item.id === id);
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vehicle) return;
    setVin(vehicle.vin ?? '');
    setMileage(vehicle.mileage ? String(vehicle.mileage) : '');
  }, [vehicle?.id, vehicle?.vin, vehicle?.mileage]);

  if (!vehicle) {
    return (
      <Screen>
        <Text style={styles.missing}>Vehicle not found.</Text>
      </Screen>
    );
  }

  const current = vehicle;
  const related = repairOrders.filter((order) => order.vehicleId === current.id);
  const needsIdentity = !current.vin?.trim() || !current.mileage;

  async function onSaveIdentity() {
    setError('');
    const parsedMileage = Number(mileage.replace(/,/g, ''));
    if (Number.isNaN(parsedMileage) || mileage.trim() === '') {
      setError('Enter current mileage.');
      return;
    }
    if (vin.trim() && vin.replace(/\s/g, '').length !== 17) {
      setError('VIN should be 17 characters if provided.');
      return;
    }
    setSaving(true);
    try {
      await updateVehicle(current.id, {
        vin: vin.replace(/\s/g, ''),
        mileage: parsedMileage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <FadeIn>
        <Card media={<VehiclePhoto vehicle={current} height={210} />}>
          <Text style={styles.title}>{vehicleLabel(current)}</Text>
          <Text style={styles.meta}>{formatVehicleIdentity(current)}</Text>
          <Button
            label="Book service"
            onPress={() => {
              selectVehicle(current.id);
              router.push('/(app)/(tabs)/book');
            }}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={80}>
        <Text style={styles.section}>{needsIdentity ? 'Add VIN & mileage' : 'VIN & mileage'}</Text>
        <Card>
          {needsIdentity ? (
            <Text style={styles.hint}>
              This car was added without VIN or mileage. Enter them here so the shop has the right details.
            </Text>
          ) : null}
          <View style={styles.form}>
            <Input
              label="VIN"
              value={vin}
              onChangeText={setVin}
              autoCapitalize="characters"
              placeholder="17-character VIN"
            />
            <Input
              label="Mileage"
              value={mileage}
              onChangeText={setMileage}
              keyboardType="number-pad"
              placeholder="28410"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={saving ? 'Saving…' : 'Save VIN & mileage'} onPress={onSaveIdentity} loading={saving} />
          </View>
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
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  form: {
    gap: 12,
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
  error: {
    color: colors.danger,
    fontFamily: fonts.bodyMedium,
  },
  missing: {
    color: colors.text,
    marginTop: 24,
    fontFamily: fonts.displayMedium,
  },
});
