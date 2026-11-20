import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { serviceTypes } from '@/data/services';
import { vehicleLabel } from '@/lib/format';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

function upcomingSlots() {
  const slots: { label: string; iso: string }[] = [];
  const times = [9, 11, 13, 15];
  for (let day = 1; day <= 7; day += 1) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    if (date.getDay() === 0) continue;
    times.forEach((hour) => {
      const slot = new Date(date);
      slot.setHours(hour, 0, 0, 0);
      slots.push({
        iso: slot.toISOString(),
        label: slot.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
      });
    });
  }
  return slots.slice(0, 12);
}

export default function BookScreen() {
  const { vehicles, selectedVehicle, bookAppointment } = useApp();
  const slots = useMemo(upcomingSlots, []);
  const [vehicleId, setVehicleId] = useState(selectedVehicle?.id ?? vehicles[0]?.id ?? '');
  const [serviceTypeId, setServiceTypeId] = useState(serviceTypes[0].id);

  useEffect(() => {
    if (!vehicleId && (selectedVehicle?.id || vehicles[0]?.id)) {
      setVehicleId(selectedVehicle?.id ?? vehicles[0]?.id ?? '');
    }
  }, [selectedVehicle, vehicleId, vehicles]);
  const [scheduledAt, setScheduledAt] = useState(slots[0]?.iso ?? '');
  const [notes, setNotes] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function addPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo access is needed to upload vehicle pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUris((current) => [...current, result.assets[0].uri]);
    }
  }

  async function onSubmit() {
    setError('');
    if (!vehicleId) {
      setError('Add a vehicle before booking.');
      return;
    }
    setLoading(true);
    try {
      const appointment = await bookAppointment({
        vehicleId,
        serviceTypeId,
        scheduledAt,
        notes,
        photoUris,
      });
      router.push(`/(app)/appointment/${appointment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book appointment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Book appointment</Text>
      <Text style={styles.subtitle}>Choose a vehicle, service, and drop-off window.</Text>

      <Text style={styles.label}>Vehicle</Text>
      {vehicles.length === 0 ? (
        <Button label="Add a vehicle first" onPress={() => router.push('/(app)/vehicle/add')} />
      ) : (
        <View style={styles.wrap}>
          {vehicles.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              onPress={() => setVehicleId(vehicle.id)}
              style={[styles.chip, vehicleId === vehicle.id && styles.chipOn]}>
              <Text style={[styles.chipText, vehicleId === vehicle.id && styles.chipTextOn]}>
                {vehicleLabel(vehicle)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.label}>Service</Text>
      <View style={styles.wrap}>
        {serviceTypes.map((service) => (
          <Pressable
            key={service.id}
            onPress={() => setServiceTypeId(service.id)}
            style={[styles.chip, serviceTypeId === service.id && styles.chipOn]}>
            <Text style={[styles.chipText, serviceTypeId === service.id && styles.chipTextOn]}>
              {service.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Drop-off time</Text>
      <View style={styles.wrap}>
        {slots.map((slot) => (
          <Pressable
            key={slot.iso}
            onPress={() => setScheduledAt(slot.iso)}
            style={[styles.chip, scheduledAt === slot.iso && styles.chipOn]}>
            <Text style={[styles.chipText, scheduledAt === slot.iso && styles.chipTextOn]}>{slot.label}</Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="What’s going on?"
        value={notes}
        onChangeText={setNotes}
        placeholder="Noisy while charging, warning light, leak..."
        autoCapitalize="sentences"
        multiline
      />

      <Text style={styles.label}>Pictures of the problem</Text>
      <View style={styles.photos}>
        {photoUris.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.photo} />
        ))}
        <Pressable style={styles.addPhoto} onPress={addPhoto}>
          <Text style={styles.addPhotoText}>+ Photo</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Request appointment" onPress={onSubmit} loading={loading} disabled={!vehicleId} />
      <Card style={{ marginTop: 12 }}>
        <Text style={styles.note}>
          The shop will confirm the time. You’ll see status updates here after drop-off.
        </Text>
      </Card>
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
    marginBottom: 22,
    marginTop: 6,
  },
  label: {
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 16,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipTextOn: {
    color: colors.primary,
  },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
  },
  addPhoto: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  addPhotoText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
  note: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
