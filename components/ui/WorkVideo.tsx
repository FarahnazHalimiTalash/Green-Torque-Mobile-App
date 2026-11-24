import { colors, radius } from '@/constants/theme';
import { shopMediaUrl } from '@/lib/shop-api';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  uri: string;
  caption?: string;
};

export function WorkVideo({ uri, caption }: Props) {
  const source = shopMediaUrl(uri);
  const player = useVideoPlayer(source, (next) => {
    next.loop = false;
  });

  return (
    <View style={styles.wrap}>
      <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  video: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
  caption: {
    color: colors.text,
    lineHeight: 22,
  },
});
