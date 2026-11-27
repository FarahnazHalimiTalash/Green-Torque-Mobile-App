import { colors, radius } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, type ViewStyle } from 'react-native';

export type AppIconName =
  | 'home'
  | 'vehicles'
  | 'book'
  | 'history'
  | 'notifications'
  | 'card'
  | 'car'
  | 'camera'
  | 'video'
  | 'close'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronBack'
  | 'chevronForward'
  | 'alert'
  | 'edit'
  | 'shield'
  | 'image';

const OUTLINE: Record<AppIconName, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  vehicles: 'car-outline',
  book: 'calendar-outline',
  history: 'time-outline',
  notifications: 'notifications-outline',
  card: 'card-outline',
  car: 'car-outline',
  camera: 'camera-outline',
  video: 'videocam-outline',
  close: 'close',
  chevronRight: 'chevron-forward',
  chevronDown: 'chevron-down',
  chevronBack: 'chevron-back',
  chevronForward: 'chevron-forward',
  alert: 'alert-circle-outline',
  edit: 'create-outline',
  shield: 'shield-checkmark-outline',
  image: 'image-outline',
};

const FILLED: Record<AppIconName, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  vehicles: 'car-sport',
  book: 'calendar',
  history: 'time',
  notifications: 'notifications',
  card: 'card',
  car: 'car-sport',
  camera: 'camera',
  video: 'videocam',
  close: 'close',
  chevronRight: 'chevron-forward',
  chevronDown: 'chevron-down',
  chevronBack: 'chevron-back',
  chevronForward: 'chevron-forward',
  alert: 'alert-circle',
  edit: 'create',
  shield: 'shield-checkmark',
  image: 'image',
};

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  filled?: boolean;
  /** Soft green tile behind the icon (modern app chrome). */
  tiled?: boolean;
  style?: ViewStyle;
};

export function Icon({
  name,
  size = 22,
  color = colors.text,
  filled = false,
  tiled = false,
  style,
}: Props) {
  const glyph = filled ? FILLED[name] : OUTLINE[name];
  const icon = <Ionicons name={glyph} size={size} color={color} />;

  if (!tiled) {
    return style ? <View style={style}>{icon}</View> : icon;
  }

  return (
    <View style={[styles.tile, style]}>
      <Ionicons name={glyph} size={size} color={color || colors.primaryDeep} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
