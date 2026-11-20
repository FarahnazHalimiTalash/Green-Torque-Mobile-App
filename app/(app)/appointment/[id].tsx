import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { getServiceType } from '@/data/services';
import { formatDateTime, vehicleLabel } from '@/lib/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { createElement } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

const steps = ['requested', 'confirmed', 'checked_in', 'completed'] as const;

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, vehicles, cancelAppointment } = useApp();
  const appointment = appointments.find((item) => item.id === id);
  const vehicle = vehicles.find((item) => item.id === appointment?.vehicleId);
  const service = appointment ? getServiceType(appointment.serviceTypeId) : undefined;

  if (!appointment) {
    return (
      <Screen>
        <Text style={styles.title}>Appointment not found.</Text>
      </Screen>
    );
  }

  const currentIndex = steps.indexOf(appointment.status as (typeof steps)[number]);
  const photos = appointment.photoUris ?? [];
  const videos = appointment.videoUris ?? [];

  return (
    <Screen>
      <StatusBadge status={appointment.status} />
      <Text style={styles.title}>{service?.name ?? 'Service appointment'}</Text>
      <Text style={styles.meta}>{vehicle ? vehicleLabel(vehicle) : 'Vehicle'} · {formatDateTime(appointment.scheduledAt)}</Text>
      <Card>
        {steps.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, index <= currentIndex && styles.dotOn]} />
            <Text style={[styles.stepText, index <= currentIndex && styles.stepOn]}>
              {step.replaceAll('_', ' ')}
            </Text>
          </View>
        ))}
      </Card>
      {appointment.notes ? (
        <Card>
          <Text style={styles.label}>Customer notes</Text>
          <Text style={styles.body}>{appointment.notes}</Text>
        </Card>
      ) : null}
      {photos.length || videos.length ? (
        <View style={styles.photos}>
          {photos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.photo} />
          ))}
          {videos.map((uri) =>
            Platform.OS === 'web' ? (
              createElement('video', {
                key: uri,
                src: uri,
                controls: true,
                style: {
                  width: 160,
                  height: 88,
                  borderRadius: 12,
                  backgroundColor: '#000',
                },
              })
            ) : (
              <View key={uri} style={[styles.photo, styles.videoTile]}>
                <Ionicons name="videocam" size={22} color={colors.primary} />
                <Text style={styles.videoLabel}>Video</Text>
              </View>
            ),
          )}
        </View>
      ) : null}
      {appointment.status === 'requested' || appointment.status === 'confirmed' ? (
        <Button label="Cancel appointment" variant="danger" onPress={() => cancelAppointment(appointment.id)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 12,
  },
  meta: {
    color: colors.textMuted,
    marginBottom: 18,
    marginTop: 6,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotOn: {
    backgroundColor: colors.primary,
  },
  stepText: {
    color: colors.textDim,
    textTransform: 'capitalize',
  },
  stepOn: {
    color: colors.text,
    fontWeight: '700',
  },
  label: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  body: {
    color: colors.text,
    lineHeight: 22,
  },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  videoTile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  videoLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
