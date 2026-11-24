import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { dueChargesForOrder, dueTotal } from '@/lib/billing';
import { formatCardNumber, paymentMethodLabel, tokenizeCard } from '@/lib/card';
import { formatMoney } from '@/lib/format';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PaymentsScreen() {
  const { paymentMethods, payments, repairOrders, savePaymentMethod, removePaymentMethod, payDue } = useApp();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [selectedId, setSelectedId] = useState(paymentMethods[0]?.id ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = paymentMethods.find((item) => item.id === selectedId) ?? paymentMethods[0];

  useEffect(() => {
    if (!paymentMethods.some((item) => item.id === selectedId)) {
      setSelectedId(paymentMethods[0]?.id ?? '');
    }
  }, [paymentMethods, selectedId]);

  async function onSave() {
    setError('');
    setBusy(true);
    try {
      tokenizeCard({ cardNumber: number, expMonth, expYear, cardholderName: name, cvc });
      await savePaymentMethod({ cardNumber: number, expMonth, expYear, cardholderName: name, cvc });
      setName('');
      setNumber('');
      setExpMonth('');
      setExpYear('');
      setCvc('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this card.');
    } finally {
      setBusy(false);
    }
  }

  async function onPay(repairOrderId: string) {
    setError('');
    if (!selected) {
      setError('Add a payment method first.');
      return;
    }
    setBusy(true);
    try {
      await payDue(repairOrderId, selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete payment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.subtitle}>
        Save a card to pay diagnosis fees and approved extra work. Green Torque stores only the last four digits, never the full card number.
      </Text>

      <Card>
        <Text style={styles.label}>Saved methods</Text>
        {paymentMethods.length === 0 ? (
          <Text style={styles.body}>No card on file yet.</Text>
        ) : (
          paymentMethods.map((method) => {
            const active = (selected?.id ?? '') === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => setSelectedId(method.id)}
                style={[styles.method, active && styles.methodOn]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.body}>{paymentMethodLabel(method)}</Text>
                  <Text style={styles.meta}>
                    {method.cardholderName} · {String(method.expMonth).padStart(2, '0')}/{String(method.expYear).slice(-2)}
                  </Text>
                </View>
                <Button label="Remove" variant="ghost" onPress={() => removePaymentMethod(method.id)} />
              </Pressable>
            );
          })
        )}
      </Card>

      <Card>
        <Text style={styles.label}>Add a card</Text>
        <Text style={styles.meta}>Demo card: 4242 4242 4242 4242 · any future date · any 3-digit CVC</Text>
        <Input label="Name on card" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Farahnaz" />
        <Input
          label="Card number"
          value={number}
          onChangeText={(value) => setNumber(formatCardNumber(value))}
          keyboardType="number-pad"
          placeholder="4242 4242 4242 4242"
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="Exp month" value={expMonth} onChangeText={setExpMonth} keyboardType="number-pad" placeholder="12" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Exp year" value={expYear} onChangeText={setExpYear} keyboardType="number-pad" placeholder="28" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="CVC" value={cvc} onChangeText={setCvc} keyboardType="number-pad" secureTextEntry placeholder="123" />
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={busy ? 'Saving…' : 'Save payment method'} onPress={onSave} disabled={busy} />
      </Card>

      {repairOrders.map((order) => {
        const due = dueChargesForOrder(order, payments);
        const paid = payments.filter((item) => item.repairOrderId === order.id);
        if (!due.length && !paid.length) return null;
        return (
          <Card key={order.id}>
            <Text style={styles.label}>Repair #{order.number}</Text>
            {due.map((item) => (
              <Text key={item.sourceId} style={styles.body}>
                Due · {item.description} · {formatMoney(item.amount)}
              </Text>
            ))}
            {paid.map((item) => (
              <Text key={item.id} style={styles.meta}>
                Paid {formatMoney(item.amount)} · {item.methodBrand} •••• {item.methodLast4} · {item.description}
              </Text>
            ))}
            {due.length ? (
              <Button
                label={`Pay ${formatMoney(dueTotal(due))}${selected ? ` with ${paymentMethodLabel(selected)}` : ''}`}
                onPress={() => onPay(order.id)}
                disabled={busy || !selected}
              />
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 12,
    marginTop: 6,
  },
  label: {
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  body: {
    color: colors.text,
    lineHeight: 22,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4,
  },
  error: {
    color: colors.danger,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
  },
  methodOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
});
