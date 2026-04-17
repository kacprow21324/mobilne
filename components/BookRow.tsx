import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STATUS_LABELS, type BookStatus } from '@/lib/status';
import { StarRating } from './StarRating';

type Props = {
  title: string;
  author: string;
  coverUrl: string | null;
  status?: BookStatus;
  rating?: number | null;
  rightSlot?: ReactNode;
  onPress?: () => void;
};

export function BookRow({ title, author, coverUrl, status, rating, rightSlot, onPress }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" />
      ) : (
        <View style={[styles.cover, styles.coverFallback]}>
          <Text style={styles.coverFallbackText}>{title.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.author} numberOfLines={1}>{author}</Text>
        {status && <Text style={styles.status}>{STATUS_LABELS[status]}</Text>}
        {typeof rating === 'number' && rating > 0 && (
          <View style={{ marginTop: 4 }}>
            <StarRating value={rating} size={14} disabled />
          </View>
        )}
      </View>
      {rightSlot}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    alignItems: 'center',
  },
  cover: { width: 56, height: 80, borderRadius: 4, backgroundColor: '#eee' },
  coverFallback: { justifyContent: 'center', alignItems: 'center' },
  coverFallbackText: { fontSize: 28, fontWeight: '600', color: '#888' },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  author: { fontSize: 13, color: '#555', marginTop: 2 },
  status: { fontSize: 12, color: '#357', marginTop: 4 },
});
