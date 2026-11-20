import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Select } from '@/components/ui/Select';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { evTypeForModel, MAKE_OPTIONS, modelsForMake, yearsForModel } from '@/lib/vehicle-catalog';
import type { EvType } from '@/types';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const evTypes: { id: EvType; label: string }[] = [
  { id: 'ev', label: 'EV' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'ice', label: 'Gas / other' },
];

export default function AddVehicleScreen() {
  const { addVehicle } = useApp();
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [nickname, setNickname] = useState('');
  const [evType, setEvType] = useState<EvType>('ev');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const modelOptions = useMemo(
    () => modelsForMake(make).map((item) => ({ label: item.name, value: item.name })),
    [make],
  );
  const yearOptions = useMemo(
    () => yearsForModel(make, model).map((item) => ({ label: String(item), value: String(item) })),
    [make, model],
  );

  function onMakeChange(next: string) {
    setMake(next);
    setModel('');
    setYear('');
  }

  function onModelChange(next: string) {
    setModel(next);
    setYear('');
    const nextType = evTypeForModel(make, next);
    if (nextType) setEvType(nextType);
  }

  async function onSubmit() {
    setError('');
    const parsedYear = Number(year);
    const parsedMileage = Number(mileage.replace(/,/g, ''));
    if (!make || !model || !year) {
      setError('Choose make, model, and year.');
      return;
    }
    if (!parsedYear) {
      setError('Choose a valid year.');
      return;
    }
    if (Number.isNaN(parsedMileage) || mileage.trim() === '') {
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
