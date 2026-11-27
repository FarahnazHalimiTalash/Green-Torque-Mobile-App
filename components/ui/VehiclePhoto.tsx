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

/** Clean studio vehicle hero — no tinted overlays or noisy frames. */
export function VehiclePhoto({ vehicle, height = 190, style }: Props) {
  const resolved = resolveVehiclePhoto(vehicle);
  const [source, setSource] = useState(resolved);

  useEffect(() => {
    setSource(resolveVehiclePhoto(vehicle));
  }, [vehicle.make, vehicle.model, vehicle.evType]);

  return (
    <View style={[styles.stage, { height }, style]}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        onError={() => setSource(EMPTY)}
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
