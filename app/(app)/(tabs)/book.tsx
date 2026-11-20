import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Select } from '@/components/ui/Select';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { serviceTypes } from '@/data/services';
import { vehicleLabel } from '@/lib/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { createElement, useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type MediaKind = 'photo' | 'video';
type MediaItem = { uri: string; kind: MediaKind };

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

function MediaThumb({ item, onRemove }: { item: MediaItem; onRemove: () => void }) {
  return (
    <View>
      {item.kind === 'photo' ? (
        <Image source={{ uri: item.uri }} style={styles.photo} />
      ) : Platform.OS === 'web' ? (
        createElement('video', {
          src: item.uri,
          style: {
            width: 72,
            height: 72,
            borderRadius: 10,
            objectFit: 'cover',
            backgroundColor: '#000',
          },
        })
      ) : (
        <View style={[styles.photo, styles.videoTile]}>
          <Ionicons name="videocam" size={22} color={colors.primary} />
        </View>
      )}
      <Pressable accessibilityLabel="Remove attachment" onPress={onRemove} style={styles.remove}>
        <Ionicons name="close" size={12} color={colors.white} />
      </Pressable>
    </View>
  );
}

export default function BookScreen() {
  const { vehicles, selectedVehicle, bookAppointment } = useApp();
  const slots = useMemo(upcomingSlots, []);
  const [vehicleId, setVehicleId] = useState(selectedVehicle?.id ?? '');
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId && selectedVehicle?.id) {
      setVehicleId(selectedVehicle.id);
    }
  }, [selectedVehicle, vehicleId]);

  const vehicleOptions = vehicles.map((vehicle) => ({
    label: vehicleLabel(vehicle),
    value: vehicle.id,
  }));
  const serviceOptions = serviceTypes.map((service) => ({
    label: service.name,
    value: service.id,
  }));
  const dropOffOptions = slots.map((slot) => ({
    label: slot.label,
    value: slot.iso,
  }));

  async function addMedia(kind: MediaKind) {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo and video access is needed to attach files.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === 'photo' ? ['images'] : ['videos'],
      quality: 0.8,
      videoMaxDuration: 60,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const pickedKind: MediaKind = asset.type === 'video' ? 'video' : kind;
      setMedia((current) => [...current, { uri: asset.uri, kind: pickedKind }]);
    }
  }

  async function onSubmit() {
    setError('');
    if (!vehicleId) {
      setError('Choose a vehicle.');
      return;
    }
    if (!serviceTypeId) {
      setError('Choose a service.');
      return;
    }
    if (!scheduledAt) {
      setError('Choose a drop-off time.');
      return;
    }
    setLoading(true);
    try {
      const appointment = await bookAppointment({
        vehicleId,
        serviceTypeId,
        scheduledAt,
        notes,
        photoUris: media.filter((item) => item.kind === 'photo').map((item) => item.uri),
        videoUris: media.filter((item) => item.kind === 'video').map((item) => item.uri),
      });
      router.push(`/(app)/appointment/${appointment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book appointment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen includeTopInset={false}>
      <Text style={styles.title}>Book appointment</Text>
      <Text style={styles.subtitle}>Choose a vehicle, service, and drop-off window.</Text>

      <View style={styles.form}>
        {vehicles.length === 0 ? (
          <Button label="Add a vehicle first" onPress={() => router.push('/(app)/vehicle/add')} />
        ) : (
          <Select
            label="Vehicle"
            value={vehicleId}
            options={vehicleOptions}
            onChange={setVehicleId}
            placeholder="Select vehicle"
          />
        )}
        <Select
          label="Service"
          value={serviceTypeId}
          options={serviceOptions}
          onChange={setServiceTypeId}
          placeholder="Select service"
        />
        <Select
          label="Drop-off"
          value={scheduledAt}
          options={dropOffOptions}
          onChange={setScheduledAt}
          placeholder="Select drop-off time"
        />

        <Input
          label="What’s going on?"
          value={notes}
          onChangeText={setNotes}
          placeholder="Noisy while charging, warning light, leak..."
          autoCapitalize="sentences"
          multiline
        />

        <Text style={styles.label}>Photos & videos</Text>
        <View style={styles.photos}>
          {media.map((item) => (
            <MediaThumb
              key={item.uri}
              item={item}
              onRemove={() => setMedia((current) => current.filter((entry) => entry.uri !== item.uri))}
            />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            style={styles.addPhoto}
            onPress={() => addMedia('photo')}>
            <Ionicons name="image" size={18} color={colors.primary} />
            <Text style={styles.addPhotoText}>Photo</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add video"
            style={styles.addPhoto}
            onPress={() => addMedia('video')}>
            <Ionicons name="videocam" size={18} color={colors.primary} />
            <Text style={styles.addPhotoText}>Video</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Request appointment" onPress={onSubmit} loading={loading} disabled={!vehicles.length} />
      </View>
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
  form: {
    gap: 14,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
  },
  videoTile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 4,
  },
  addPhotoText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  error: {
    color: colors.danger,
  },
  note: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
