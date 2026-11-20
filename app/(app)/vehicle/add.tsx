import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import type { EvType } from '@/types';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const evTypes: { id: EvType; label: string }[] = [
  { id: 'ev', label: 'EV' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'ice', label: 'Gas / other' },
];

export default function AddVehicleScreen() {
  const { addVehicle } = useApp();
  const [vin, setVin] = useState('');
  const [year, setYear] = useState('2023');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [nickname, setNickname] = useState('');
  const [evType, setEvType] = useState<EvType>('ev');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError('');
    const parsedYear = Number(year);
    const parsedMileage = Number(mileage.replace(/,/g, ''));
    if (!make.trim() || !model.trim()) {
      setError('Enter make and model.');
      return;
    }
    if (!parsedYear || parsedYear < 1990) {
      setError('Enter a valid year.');
      return;
    }
    if (Number.isNaN(parsedMileage)) {
      setError('Enter current mileage.');
      return;
    }
    if (vin && vin.replace(/\s/g, '').length !== 17) {
      setError('VIN should be 17 characters if provided.');
      return;
    }
    setLoading(true);
    try {
      const vehicle = await addVehicle({
        vin: vin.replace(/\s/g, ''),
        year: parsedYear,
        make,
        model,
        mileage: parsedMileage,
        nickname,
        evType,
      });
      router.replace(`/(app)/vehicle/${vehicle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save vehicle.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.form}>
        <Input label="VIN" value={vin} onChangeText={setVin} autoCapitalize="characters" placeholder="17-character VIN" />
        <Input label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" />
        <Input label="Make" value={make} onChangeText={setMake} autoCapitalize="words" placeholder="Tesla" />
        <Input label="Model" value={model} onChangeText={setModel} autoCapitalize="words" placeholder="Model 3" />
        <Input label="Mileage" value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="28410" />
        <Input label="Nickname (optional)" value={nickname} onChangeText={setNickname} autoCapitalize="words" placeholder="Model 3" />
        <Text style={styles.label}>Powertrain</Text>
        <View style={styles.row}>
          {evTypes.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setEvType(item.id)}
              style={[styles.chip, evType === item.id && styles.chipOn]}>
              <Text style={[styles.chipText, evType === item.id && styles.chipTextOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Save vehicle" onPress={onSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
    paddingTop: 12,
  },
  label: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  chipTextOn: {
    color: colors.primary,
  },
  error: {
    color: colors.danger,
  },
});
