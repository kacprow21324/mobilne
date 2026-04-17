import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STATUS_LABELS, STATUS_OPTIONS, type BookStatus } from '@/lib/status';

type Props = {
  value: BookStatus;
  onChange: (status: BookStatus) => void;
};

export function StatusPicker({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {STATUS_OPTIONS.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {STATUS_LABELS[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eef',
    borderWidth: 1,
    borderColor: '#ccd',
  },
  pillActive: { backgroundColor: '#3B6EEA', borderColor: '#3B6EEA' },
  text: { color: '#334', fontSize: 13 },
  textActive: { color: '#fff', fontWeight: '600' },
});
