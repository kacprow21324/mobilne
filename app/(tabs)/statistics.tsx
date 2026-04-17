import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { StarRating } from '@/components/StarRating';
import { STATUS_LABELS, type BookStatus } from '@/lib/status';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { Book } from '@/types/db';

type Stats = {
  total: number;
  finishedTotal: number;
  finishedThisYear: number;
  averageRating: number | null;
  byStatus: Record<BookStatus, number>;
  topBook: Book | null;
};

export default function Statistics() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [stats, setStats] = useState<Stats | null>(null);

  const load = useCallback(async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', currentUser.id);
    if (error) {
      Toast.show({ type: 'error', text1: 'Błąd', text2: error.message });
      return;
    }
    const books = (data ?? []) as Book[];
    const finished = books.filter((b) => b.status === 'finished');
    const year = new Date().getFullYear();
    const ratings = finished
      .map((b) => b.rating)
      .filter((r): r is number => typeof r === 'number');
    const avg = ratings.length
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : null;
    const top =
      finished
        .filter((b) => typeof b.rating === 'number')
        .sort(
          (a, b) =>
            (b.rating! - a.rating!) ||
            (+new Date(b.date_added) - +new Date(a.date_added)),
        )[0] ?? null;
    setStats({
      total: books.length,
      finishedTotal: finished.length,
      finishedThisYear: finished.filter(
        (b) => new Date(b.date_added).getFullYear() === year,
      ).length,
      averageRating: avg,
      byStatus: {
        to_read: books.filter((b) => b.status === 'to_read').length,
        reading: books.filter((b) => b.status === 'reading').length,
        finished: finished.length,
      },
      topBook: top,
    });
  }, [currentUser]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!stats) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Card label="Wszystkie książki" value={stats.total} />
      <Card label="Przeczytane (ogółem)" value={stats.finishedTotal} />
      <Card label="Przeczytane w tym roku" value={stats.finishedThisYear} />
      <Card
        label="Średnia ocena"
        value={stats.averageRating !== null ? stats.averageRating.toFixed(2) : '—'}
      />
      <Text style={styles.sectionHeader}>Według statusu</Text>
      {(Object.keys(stats.byStatus) as BookStatus[]).map((s) => (
        <Card key={s} label={STATUS_LABELS[s]} value={stats.byStatus[s]} />
      ))}
      {stats.topBook && (
        <View style={styles.top}>
          <Text style={styles.sectionHeader}>Najwyżej oceniona</Text>
          <Text style={styles.topTitle}>
            {stats.topBook.title} — {stats.topBook.author}
          </Text>
          <StarRating value={stats.topBook.rating} disabled />
        </View>
      )}
    </ScrollView>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 10 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: { fontSize: 14, color: '#333' },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#3B6EEA' },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  top: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginTop: 6,
    gap: 8,
  },
  topTitle: { fontSize: 15, fontWeight: '600' },
});
