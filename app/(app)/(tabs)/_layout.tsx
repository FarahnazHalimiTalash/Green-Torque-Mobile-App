import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { router, Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabGlyph({
  name,
  focused,
}: {
  name: 'home' | 'vehicles' | 'book' | 'history';
  focused: boolean;
}) {
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapOn]}>
      <Icon name={name} size={20} filled={focused} color={focused ? colors.primaryDeep : colors.textDim} />
    </View>
  );
}

function HeaderBell() {
  const { unreadCount } = useApp();

  return (
    <Pressable style={styles.bell} onPress={() => router.push('/(app)/notifications')}>
      <Icon name="notifications" size={20} color={colors.textOnDark} />
      {unreadCount > 0 ? (
        <View style={styles.dot}>
          <Text style={styles.dotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitle: () => <Logo height={44} width={168} clear />,
        headerRight: () => <HeaderBell />,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 10),
          height: 68,
          borderRadius: radius.xl,
          backgroundColor: colors.white,
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: 6,
          ...shadow.card,
          ...(Platform.OS === 'web' ? { marginHorizontal: 16, marginBottom: 12 } : null),
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.bodyBold,
          letterSpacing: 0.15,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabGlyph name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ focused }) => <TabGlyph name="vehicles" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          tabBarIcon: ({ focused }) => <TabGlyph name="book" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabGlyph name="history" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    width: 36,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapOn: {
    backgroundColor: colors.primaryMuted,
  },
  bell: {
    width: 40,
    height: 40,
    marginRight: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  dotText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
});
