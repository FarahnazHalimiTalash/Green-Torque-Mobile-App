import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHeader } from '@/components/ui/PageHeader';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, fonts } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatDate, formatMoney, vehicleLabel } from '@/lib/format';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const { repairOrders, appointments, vehicles } = useApp();
  const history = [...repairOrders].sort((a, b) => +new Date(b.openedAt) - +new Date(a.openedAt));

  return (
    <Screen includeTopInset={false}>
      <FadeIn>
        <PageHeader title="History" />
      </FadeIn>

      {history.length === 0 && appointments.length === 0 ? (
        <FadeIn delay={80}>
          <Card tone="quiet">
            <Text style={styles.empty}>No history yet</Text>
          </Card>
        </FadeIn>
      ) : null}

      <View style={{ gap: 12 }}>
        {history.map((order, index) => {
          const vehicle = vehicles.find((item) => item.id === order.vehicleId);
          return (
            <FadeIn key={order.id} delay={70 + index * 45}>
              <Card onPress={() => router.push(`/(app)/repair/${order.id}`)}>
                <StatusBadge status={order.status} />
                <Text style={styles.name}>
                  #{order.number} · {order.serviceSummary}
                </Text>
                <Text style={styles.meta}>
                  {vehicle ? vehicleLabel(vehicle) : 'Vehicle'} · {formatDate(order.openedAt)}
                  {order.diagnosisCharge?.status === 'sent'
                    ? ` · Diagnosis ${formatMoney(order.diagnosisCharge.amount)}`
                    : ''}
                  {order.estimate
                    ? ` · Estimate ${formatMoney(order.estimate.amount)} (${order.estimate.status})`
                    : ''}
                  {order.foundProblems?.length
                    ? ` · ${order.foundProblems.length} extra estimate${order.foundProblems.length === 1 ? '' : 's'}`
                    : ''}
                </Text>
              </Card>
            </FadeIn>
          );
        })}
        {appointments
          .filter((item) => !repairOrders.some((order) => order.appointmentId === item.id))
          .map((appointment, index) => (
            <FadeIn key={appointment.id} delay={90 + index * 45}>
              <Card onPress={() => router.push(`/(app)/appointment/${appointment.id}`)}>
                <StatusBadge status={appointment.status} />
                <Text style={styles.name}>Appointment</Text>
                <Text style={styles.meta}>{formatDate(appointment.scheduledAt)}</Text>
              </Card>
            </FadeIn>
          ))}
      </View>
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
    fontSize: 17,
    fontFamily: fonts.displayMedium,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    lineHeight: 21,
    fontSize: 14,
  },
});
