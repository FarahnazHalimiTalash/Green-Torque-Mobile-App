import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatDate, formatMoney, vehicleLabel } from '@/lib/format';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const { repairOrders, appointments, vehicles } = useApp();
  const history = [...repairOrders].sort((a, b) => +new Date(b.openedAt) - +new Date(a.openedAt));

  return (
    <Screen includeTopInset={false}>
      <Text style={styles.title}>Service history</Text>
      <Text style={styles.subtitle}>
        View-only record of previous work, estimates, and completed visits. History cannot be edited in the app.
      </Text>
      {history.length === 0 && appointments.length === 0 ? (
        <Card>
          <Text style={styles.empty}>No history yet</Text>
          <Text style={styles.subtitle}>Completed repair orders will show up here.</Text>
        </Card>
      ) : null}
      <View style={{ gap: 12 }}>
        {history.map((order) => {
          const vehicle = vehicles.find((item) => item.id === order.vehicleId);
          return (
            <Card key={order.id} onPress={() => router.push(`/(app)/repair/${order.id}`)}>
              <StatusBadge status={order.status} />
              <Text style={styles.name}>
                #{order.number} · {order.serviceSummary}
              </Text>
              <Text style={styles.meta}>
                {vehicle ? vehicleLabel(vehicle) : 'Vehicle'} · {formatDate(order.openedAt)}
                {order.diagnosisCharge?.status === 'sent' ? ` · Diagnosis ${formatMoney(order.diagnosisCharge.amount)}` : ''}
                {order.estimate ? ` · Estimate ${formatMoney(order.estimate.amount)} (${order.estimate.status})` : ''}
                {order.foundProblems?.length ? ` · ${order.foundProblems.length} extra estimate${order.foundProblems.length === 1 ? '' : 's'}` : ''}
              </Text>
            </Card>
          );
        })}
        {appointments
          .filter((item) => !repairOrders.some((order) => order.appointmentId === item.id))
          .map((appointment) => (
            <Card
              key={appointment.id}
              onPress={() => router.push(`/(app)/appointment/${appointment.id}`)}>
              <StatusBadge status={appointment.status} />
              <Text style={styles.name}>Appointment</Text>
              <Text style={styles.meta}>{formatDate(appointment.scheduledAt)}</Text>
            </Card>
          ))}
      </View>
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
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
  },
});
