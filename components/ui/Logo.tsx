import { Image, StyleSheet } from 'react-native';

type Props = {
  height?: number;
  width?: number;
  clear?: boolean;
};

export function Logo({ height = 48, width = 180, clear = false }: Props) {
  return (
    <Image
      source={clear ? require('../../assets/images/logo-clear.png') : require('../../assets/images/logo.png')}
      style={[!clear && styles.image, { height, width }]}
      resizeMode="contain"
      accessibilityLabel="Green Torque Hybrid/EV Repair"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#000000',
  },
});
