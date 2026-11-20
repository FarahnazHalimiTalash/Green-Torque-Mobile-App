import { colors, radius } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createElement, useState, type CSSProperties } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const webSelectStyle: CSSProperties = {
  width: '100%',
  height: 52,
  backgroundColor: 'transparent',
  color: colors.text,
  border: 'none',
  outline: 'none',
  fontSize: 16,
  paddingLeft: 10,
  paddingRight: 36,
  appearance: 'none' as CSSProperties['appearance'],
};

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  disabled,
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const unavailable = disabled || options.length === 0;
  const controlled = onOpenChange != null;
  const visible = controlled ? Boolean(open) : internalOpen;

  function setVisible(next: boolean) {
    if (controlled) onOpenChange(next);
    else setInternalOpen(next);
  }

  function pick(next: string) {
    onChange(next);
    setVisible(false);
  }

  const menu = options.map((option) => {
    const on = option.value === value;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        onPress={() => pick(option.value)}
        style={[styles.option, on && styles.optionOn]}>
        <Text style={[styles.optionText, on && styles.optionTextOn]}>{option.label}</Text>
      </Pressable>
    );
  });

  if (Platform.OS === 'web' && !controlled) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.box, unavailable && styles.boxDisabled]}>
          {createElement(
            'select',
            {
              value,
              disabled: unavailable,
              'aria-label': label,
              onChange: (event: { target: { value: string } }) => onChange(event.target.value),
              style: {
                ...webSelectStyle,
                color: selected ? colors.text : colors.textDim,
                cursor: unavailable ? 'not-allowed' : 'pointer',
              },
            },
            createElement('option', { key: '__empty', value: '' }, placeholder),
            ...options.map((option) =>
              createElement('option', { key: option.value, value: option.value }, option.label),
            ),
          )}
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} style={styles.webChevron} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={unavailable}
        onPress={() => setVisible(!visible)}
        style={[styles.box, styles.nativeBox, unavailable && styles.boxDisabled]}>
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      {Platform.OS === 'web' ? (
        visible && !unavailable ? <View style={styles.menu}>{menu}</View> : null
      ) : (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <ScrollView>{menu}</ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
  box: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  nativeBox: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
  },
  placeholder: {
    color: colors.textDim,
  },
  webChevron: {
    position: 'absolute',
    right: 14,
    pointerEvents: 'none',
  },
  menu: {
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: -2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    maxHeight: '70%',
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  sheetTitle: {
    color: colors.textMuted,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  option: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  optionOn: {
    backgroundColor: colors.primaryMuted,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  optionTextOn: {
    color: colors.primary,
    fontWeight: '700',
  },
});
