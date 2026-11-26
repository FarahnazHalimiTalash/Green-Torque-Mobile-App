import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EstimateDecisionBox } from '@/components/ui/EstimateDecisionBox';
import { FadeIn } from '@/components/ui/FadeIn';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { colors, fonts, radius, spacing, type } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { dueChargesForOrder, dueTotal } from '@/lib/billing';
import { paymentMethodLabel } from '@/lib/card';
import { formatMileage, formatMoney, vehicleLabel } from '@/lib/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { profile, selectedVehicle, activeRepair, signOut, liveWithShop, paymentMethods, payments } =
    useApp();
  const due = activeRepair ? dueChargesForOrder(activeRepair, payments) : [];
  const card = paymentMethods[0];
  const firstName = profile?.fullName.split(' ')[0] ?? 'there';

  return (
    <Screen includeTopInset={false}>
      <FadeIn>
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Your shop dashboard</Text>
            <Text style={styles.hello}>Hello, {firstName}</Text>
            <Text style={styles.subhello}>Track repairs, estimates, and pickup in real time.</Text>
          </View>
          {liveWithShop ? (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          ) : null}
        </View>
      </FadeIn>

      <FadeIn delay={80}>
        {selectedVehicle ? (
          <Card onPress={() => router.push(`/(app)/vehicle/${selectedVehicle.id}`)} tone="emphasis">
            {selectedVehicle.photoUrl ? (
              <Image source={{ uri: selectedVehicle.photoUrl }} style={styles.vehicleHero} />
            ) : (
              <LinearGradient colors={['#DCFCE7', '#F0FDF4']} style={styles.vehicleHeroFallback}>
                <Ionicons name="car-sport" size={64} color={colors.primary} />
              </LinearGradient>
            )}
            <Text style={styles.vehicleKicker}>Your vehicle</Text>
            <Text style={styles.vehicleName}>{vehicleLabel(selectedVehicle)}</Text>
            <Text style={styles.muted}>{formatMileage(selectedVehicle.mileage)}</Text>
          </Card>
        ) : (
          <Card tone="emphasis">
            <LinearGradient colors={['#DCFCE7', '#F0FDF4']} style={styles.vehicleHeroFallback}>
              <Ionicons name="car-sport-outline" size={56} color={colors.primary} />
            </LinearGradient>
            <Text style={styles.vehicleName}>Add your first vehicle</Text>
            <Text style={styles.muted}>VIN, year, make, model, and mileage.</Text>
            <Button label="Add vehicle" onPress={() => router.push('/(app)/vehicle/add')} />
          </Card>
        )}
      </FadeIn>

      <FadeIn delay={140}>
        <SectionHeader title="Current service" />
        {activeRepair ? (
          <Card>
            <StatusBadge status={activeRepair.status} />
            <Text style={styles.repairTitle}>{activeRepair.serviceSummary}</Text>
            <Text style={styles.muted}>
              Repair Order #{activeRepair.number}
              {activeRepair.bayName ? ` · ${activeRepair.bayName}` : ''}
            </Text>
            <StatusTimeline status={activeRepair.status} />
            {(activeRepair.foundProblems ?? [])
              .filter((item) => item.estimate.status === 'sent')
              .map((item) => (
                <EstimateDecisionBox key={item.id} status={item.estimate.status} variant="found_problem" />
              ))}
            {activeRepair.estimate?.status === 'sent' ? (
              <EstimateDecisionBox status={activeRepair.estimate.status} />
            ) : null}
            <Button
              label="Repair details"
              onPress={() => router.push(`/(app)/repair/${activeRepair.id}`)}
            />
            <Button label="Message shop" variant="ghost" onPress={() => router.push('/(app)/messages')} />
          </Card>
        ) : (
          <Card tone="quiet">
            <Text style={styles.vehicleName}>No active service</Text>
            <Text style={styles.muted}>Book a drop-off and we’ll keep this card updated.</Text>
            <Button label="Book appointment" onPress={() => router.push('/(app)/(tabs)/book')} />
          </Card>
        )}
      </FadeIn>

      <FadeIn delay={200}>
        <SectionHeader title="Payment" />
        <Card onPress={() => router.push('/(app)/payments')}>
          <View style={styles.row}>
            <View style={styles.iconTile}>
              <Ionicons name="card-outline" size={22} color={colors.primaryDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleKicker}>Payment method</Text>
              <Text style={styles.vehicleName}>
                {card ? paymentMethodLabel(card) : 'Add a payment method'}
              </Text>
              <Text style={styles.muted}>
                {due.length && activeRepair
                  ? `${formatMoney(dueTotal(due))} due on repair #${activeRepair.number}`
                  : 'Pay diagnosis and approved extra work from here.'}
              </Text>
            </View>
          </View>
          <Button
            label={card ? 'Manage payment' : 'Add payment method'}
            onPress={() => router.push('/(app)/payments')}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={260}>
        <SectionHeader title="Quick actions" />
        <View style={styles.actions}>
          <Button label="Book appointment" onPress={() => router.push('/(app)/(tabs)/book')} />
          <Button
            label="Service history"
            variant="secondary"
            onPress={() => router.push('/(app)/(tabs)/history')}
          />
        </View>
      </FadeIn>

      <Pressable onPress={signOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.primaryDeep,
    fontFamily: fonts.caption,
    fontSize: type.overline,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hello: {
    color: colors.text,
    fontSize: type.hero,
    fontFamily: fonts.display,
    letterSpacing: -0.7,
  },
  subhello: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 260,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveText: {
    color: colors.primaryDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  vehicleHero: {
    width: '100%',
    height: 176,
    borderRadius: radius.md,
    marginBottom: 4,
    backgroundColor: colors.bgElevated,
  },
  vehicleHeroFallback: {
    width: '100%',
    height: 148,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  vehicleKicker: {
    color: colors.textDim,
    fontSize: 11,
    fontFamily: fonts.caption,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  vehicleName: {
    color: colors.text,
    fontSize: 21,
    fontFamily: fonts.displayMedium,
    letterSpacing: -0.3,
  },
  muted: {
    color: colors.textMuted,
    lineHeight: 21,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  repairTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.display,
    letterSpacing: -0.4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 10,
  },
  signOut: {
    alignItems: 'center',
    marginTop: 28,
  },
  signOutText: {
    color: colors.textDim,
    fontFamily: fonts.bodyMedium,
  },
});
