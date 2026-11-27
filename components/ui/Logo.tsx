import { Image } from 'react-native';

type Props = {
  height?: number;
  width?: number;
  /** Prefer transparent logo art on light or colored backgrounds. */
  clear?: boolean;
};

export function Logo({ height = 48, width = 180, clear = true }: Props) {
  return (
    <Image
      source={clear ? require('../../assets/images/logo-clear.png') : require('../../assets/images/logo.png')}
      style={{ height, width }}
      resizeMode="contain"
      accessibilityLabel="Green Torque Hybrid/EV Repair"
    />
  );
}