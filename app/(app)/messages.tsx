import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatTime } from '@/lib/format';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function MessagesScreen() {
  const { messages, sendMessage } = useApp();
  const [draft, setDraft] = useState('');

  async function onSend() {
    await sendMessage(draft);
    setDraft('');
  }

  return (
    <Screen>
      <View style={styles.thread}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.sender === 'customer' ? styles.mine : styles.theirs]}>
            <Text style={styles.body}>{message.body}</Text>
            <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message the shop"
          placeholderTextColor={colors.textDim}
          style={styles.input}
        />
        <Button label="Send" onPress={onSend} disabled={!draft.trim()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  thread: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: radius.md,
    padding: 12,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryMuted,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: {
    color: colors.text,
    lineHeight: 20,
  },
  time: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 6,
  },
  composer: {
    gap: 10,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
  },
});
