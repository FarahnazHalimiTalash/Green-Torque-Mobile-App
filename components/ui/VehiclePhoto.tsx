import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { SHOP_API_URL } from '@/lib/shop-api';
import { resolveVehiclePhoto } from '@/lib/vehicle-photo';
import type { Vehicle } from '@/types';

type Props = {
  vehicle: Pick<Vehicle, 'make' | 'model' | 'evType' | 'photoUrl'>;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

const EMPTY = { uri: `${SHOP_API_URL}/vehicles/studio-empty.jpg` };

/** Premium vehicle hero: soft studio plate + brochure crop. */
export function VehiclePhoto({ vehicle, height = 190, style }: Props) {
  const resolved = resolveVehiclePhoto(vehicle);
  const [source, setSource] = useState(resolved);

  useEffect(() => {
    setSource(resolveVehiclePhoto(vehicle));
  }, [vehicle.make, vehicle.model, vehicle.evType]);

  return (
    <View style={[styles.stage, { height }, style]}>
      <LinearGradient
        colors={['#F3F6F4', '#E7EEEA', '#DDE6E1']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        onError={() => setSource(EMPTY)}
      />
      <LinearGradient
        colors={['rgba(243,246,244,0.35)', 'transparent', 'rgba(7,20,15,0.12)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
