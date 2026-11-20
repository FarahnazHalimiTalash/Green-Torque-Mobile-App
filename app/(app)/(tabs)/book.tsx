import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Select } from '@/components/ui/Select';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import {
  SERVICE_GROUP_OPTIONS,
  serviceGroupForPowertrain,
  servicesForGroup,
} from '@/data/services';
import {
  evTypeForModel,
  MAKE_OPTIONS,
  modelsForMake,
  yearsForModel,
} from '@/lib/vehicle-catalog';
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
  const { vehicles, selectedVehicle, bookAppointment, addVehicle } = useApp();
  const slots = useMemo(upcomingSlots, []);
  const [make, setMake] = useState(selectedVehicle?.make ?? '');
  const [model, setModel] = useState(selectedVehicle?.model ?? '');
  const [year, setYear] = useState(selectedVehicle ? String(selectedVehicle.year) : '');
  const [serviceGroup, setServiceGroup] = useState(
    selectedVehicle ? serviceGroupForPowertrain(selectedVehicle.evType) : '',
  );
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!make && selectedVehicle) {
      setMake(selectedVehicle.make);
      setModel(selectedVehicle.model);
      setYear(String(selectedVehicle.year));
      setServiceGroup(serviceGroupForPowertrain(selectedVehicle.evType));
    }
  }, [make, selectedVehicle]);

  const modelOptions = modelsForMake(make).map((item) => ({ label: item.name, value: item.name }));
  const yearOptions = yearsForModel(make, model).map((item) => ({
    label: String(item),
    value: String(item),
  }));
  const serviceOptions = servicesForGroup(serviceGroup).map((service) => ({
    label: service.name,
    value: service.id,
  }));
  const dropOffOptions = slots.map((slot) => ({
    label: slot.label,
    value: slot.iso,
  }));

  function onMakeChange(next: string) {
    setMake(next);
    setModel('');
    setYear('');
    setServiceTypeId('');
  }

  function onModelChange(next: string) {
    setModel(next);
    setYear('');
    setServiceTypeId('');
    setServiceGroup(serviceGroupForPowertrain(evTypeForModel(make, next)));
  }

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
    const parsedYear = Number(year);
    if (!make || !model || !parsedYear) {
      setError('Choose make, model, and year.');
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
      let vehicle = vehicles.find(
        (item) => item.make === make && item.model === model && item.year === parsedYear,
      );
      if (!vehicle) {
        vehicle = await addVehicle({
          vin: '',
          year: parsedYear,
          make,
          model,
          mileage: 0,
          evType: evTypeForModel(make, model) ?? 'ice',
        });
      }
      const appointment = await bookAppointment({
        vehicleId: vehicle.id,
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
        <Select
          label="Make"
          value={make}
          options={MAKE_OPTIONS}
          onChange={onMakeChange}
          placeholder="Select make"
        />
        <Select
          label="Model"
          value={model}
          options={modelOptions}
          onChange={onModelChange}
          placeholder={make ? 'Select model' : 'Select make first'}
          disabled={!make}
        />
        <Select
          label="Year"
          value={year}
          options={yearOptions}
          onChange={setYear}
          placeholder={model ? 'Select year' : 'Select model first'}
          disabled={!model}
        />
        <Select
          label="Service type"
          value={serviceGroup}
          options={SERVICE_GROUP_OPTIONS}
          onChange={(next) => {
            setServiceGroup(next);
            setServiceTypeId('');
          }}
          placeholder="Select service type"
        />
        <Select
          label="Service"
          value={serviceTypeId}
          options={serviceOptions}
          onChange={setServiceTypeId}
          placeholder={serviceGroup ? 'Select service' : 'Select service type first'}
          disabled={!serviceGroup}
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
        <Button label="Request appointment" onPress={onSubmit} loading={loading} />
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
