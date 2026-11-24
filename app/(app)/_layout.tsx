import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const { profile, ready } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="vehicle/add" options={{ headerShown: true, title: 'Add vehicle' }} />
      <Stack.Screen name="vehicle/[id]" options={{ headerShown: true, title: 'Vehicle' }} />
      <Stack.Screen name="appointment/[id]" options={{ headerShown: true, title: 'Appointment' }} />
      <Stack.Screen name="repair/[id]" options={{ headerShown: true, title: 'Repair details' }} />
      <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
      <Stack.Screen name="messages" options={{ headerShown: true, title: 'Message shop' }} />
    </Stack>
  );
}
