import { Image, StyleSheet } from 'react-native';

type Props = {
  height?: number;
  width?: number;
};

export function Logo({ height = 48, width = 180 }: Props) {
  return (
    <Image
      source={require('../../assets/images/logo.png')}
      style={[styles.image, { height, width }]}
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
