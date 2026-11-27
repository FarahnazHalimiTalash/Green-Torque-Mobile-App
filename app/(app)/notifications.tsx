import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatDateTime } from '@/lib/format';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <Screen>
      {notifications.length ? (
        <Button label="Mark all read" variant="ghost" onPress={markAllNotificationsRead} />
      ) : (
        <Text style={styles.empty}>No notifications</Text>
      )}
      <View style={{ gap: 12, marginTop: 12 }}>
        {notifications.map((item) => (
          <Card
            key={item.id}
            onPress={() => {
              markNotificationRead(item.id);
              if (item.href) router.push(item.href as never);
            }}>
            <Text style={[styles.title, !item.read && styles.unread]}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.textMuted,
    marginTop: 20,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  unread: {
    color: colors.primary,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  meta: {
    color: colors.textDim,
    fontSize: 12,
  },
});
