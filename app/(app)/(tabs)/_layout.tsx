import { Logo } from '@/components/ui/Logo';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function tabColor(focused: boolean) {
  return focused ? colors.primary : colors.textDim;
}

function HeaderBell() {
  const { unreadCount } = useApp();

  return (
    <Pressable style={styles.bell} onPress={() => router.push('/(app)/notifications')}>
      <Ionicons name="notifications-outline" size={20} color={colors.textOnDark} />
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 10),
          height: 64,
          borderRadius: radius.xl,
          backgroundColor: colors.white,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
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
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={tabColor(focused)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'car-sport' : 'car-sport-outline'}
              color={tabColor(focused)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              color={tabColor(focused)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} color={tabColor(focused)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
