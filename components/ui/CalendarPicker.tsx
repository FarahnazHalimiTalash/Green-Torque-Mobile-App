import { colors, radius } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DROP_OFF_HOURS = [9, 11, 13, 15];

type Props = {
  value: string;
  onChange: (iso: string) => void;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHour(hour: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function CalendarPicker({ value, onChange }: Props) {
  const selected = value ? new Date(value) : null;
  const [visibleMonth, setVisibleMonth] = useState(() => selected ?? new Date());
  const today = startOfDay(new Date());
  const selectedHour = selected ? selected.getHours() : 9;

  const cells = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const days = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const blanks = first.getDay();
    const list: Array<Date | null> = [];
    for (let i = 0; i < blanks; i += 1) list.push(null);
    for (let day = 1; day <= days; day += 1) {
      list.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
    }
    return list;
  }, [visibleMonth]);

  function pickDate(date: Date) {
    const next = new Date(date);
    next.setHours(selectedHour, 0, 0, 0);
    onChange(next.toISOString());
  }

  function pickHour(hour: number) {
    if (!selected) return;
    const next = new Date(selected);
    next.setHours(hour, 0, 0, 0);
    onChange(next.toISOString());
  }

  const monthLabel = visibleMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Drop-off</Text>
      <View style={styles.card}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Previous month"
            onPress={() =>
              setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))
            }
            style={styles.nav}>
            <Ionicons name="chevron-back" size={18} color={colors.primary} />
          </Pressable>
          <Text style={styles.month}>{monthLabel}</Text>
          <Pressable
            accessibilityLabel="Next month"
            onPress={() =>
              setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))
            }
            style={styles.nav}>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.week}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.day} />;
            }
            const closed = date.getDay() === 0;
            const past = startOfDay(date) < today;
            const disabled = closed || past;
            const on = selected ? isSameDay(date, selected) : false;
            return (
              <Pressable
                key={date.toISOString()}
                accessibilityLabel={`Drop-off ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                disabled={disabled}
                onPress={() => pickDate(date)}
                style={[styles.day, on && styles.dayOn, disabled && styles.dayDisabled]}>
                <Text style={[styles.dayText, on && styles.dayTextOn, disabled && styles.dayTextDisabled]}>
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={[styles.label, styles.timeLabel]}>Drop-off time</Text>
      <View style={styles.times}>
        {DROP_OFF_HOURS.map((hour) => {
          const on = Boolean(selected) && selectedHour === hour;
          return (
            <Pressable
              key={hour}
              accessibilityLabel={`Drop-off ${formatHour(hour)}`}
              disabled={!selected}
              onPress={() => pickHour(hour)}
              style={[styles.time, on && styles.timeOn, !selected && styles.dayDisabled]}>
              <Text style={[styles.timeText, on && styles.timeTextOn]}>{formatHour(hour)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  dayOn: {
    backgroundColor: colors.primary,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayText: {
    color: colors.text,
    fontWeight: '600',
  },
  dayTextOn: {
    color: colors.bg,
    fontWeight: '800',
  },
  dayTextDisabled: {
    color: colors.textDim,
  },
  timeLabel: {
    marginTop: 6,
  },
  times: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  time: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  timeOn: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  timeText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  timeTextOn: {
    color: colors.primary,
  },
});
