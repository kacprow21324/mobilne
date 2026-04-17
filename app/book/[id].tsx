import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { StarRating } from '@/components/StarRating';
import { normalize } from '@/lib/normalize';
import { STATUS_LABELS } from '@/lib/status';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { Book } from '@/types/db';

type ReaderRow = {
  id: string;
  user_id: string;
  rating: number | null;
  date_added: string;
  profiles: { username: string } | { username: string }[] | null;
};

type Reader = {
  id: string;
  user_id: string;
  username: string;
  rating: number | null;
  date_added: string;
  isFollowed: boolean;
};

function readUsername(profiles: ReaderRow['profiles']): string {
  if (!profiles) return '(nieznany)';
  if (Array.isArray(profiles)) return profiles[0]?.username ?? '(nieznany)';
  return profiles.username;
}

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [book, setBook] = useState<Book | null>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id || !currentUser) return;
    setLoading(true);

    const { data: b, error: bErr } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single<Book>();
    if (bErr || !b) {
      Toast.show({ type: 'error', text1: 'Nie znaleziono książki' });
      setLoading(false);
      return;
    }
    setBook(b);

    const { data: others, error: oErr } = await supabase
      .from('public_finished_books')
      .select('id, user_id, rating, date_added, profiles:user_id(username)')
      .eq('title_normalized', normalize(b.title))
      .eq('author_normalized', normalize(b.author))
      .neq('user_id', currentUser.id);

    if (oErr) {
      Toast.show({
        type: 'error',
        text1: 'Błąd sekcji społecznościowej',
        text2: oErr.message,
      });
      setReaders([]);
      setLoading(false);
      return;
    }

    const rows = (others ?? []) as ReaderRow[];
    const userIds = rows.map((r) => r.user_id);
    let followed = new Set<string>();
    if (userIds.length > 0) {
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUser.id)
        .in('following_id', userIds);
      followed = new Set((follows ?? []).map((f) => f.following_id));
    }
    setReaders(
      rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        username: readUsername(r.profiles),
        rating: r.rating,
        date_added: r.date_added,
        isFollowed: followed.has(r.user_id),
      })),
    );
    setLoading(false);
  }, [id, currentUser]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function follow(userId: string) {
    if (!currentUser) return;
    const { error } = await supabase
      .from('user_follows')
      .insert({ follower_id: currentUser.id, following_id: userId });
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Nie udało się zaobserwować',
        text2: error.message,
      });
      return;
    }
    Toast.show({ type: 'success', text1: 'Obserwujesz użytkownika' });
    setReaders((rs) =>
      rs.map((r) => (r.user_id === userId ? { ...r, isFollowed: true } : r)),
    );
  }

  function confirmDelete() {
    Alert.alert('Usunąć książkę?', 'Tej operacji nie można cofnąć.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          if (!book) return;
          const { error } = await supabase.from('books').delete().eq('id', book.id);
          if (error) {
            Toast.show({ type: 'error', text1: 'Błąd', text2: error.message });
            return;
          }
          Toast.show({ type: 'success', text1: 'Usunięto' });
          router.back();
        },
      },
    ]);
  }

  if (loading || !book) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        {book.cover_url ? (
          <Image
            source={{ uri: book.cover_url }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.cover, { backgroundColor: '#eee' }]} />
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          <Text style={styles.status}>{STATUS_LABELS[book.status]}</Text>
          {book.status === 'finished' && book.rating ? (
            <StarRating value={book.rating} size={18} disabled />
          ) : null}
        </View>
      </View>

      {book.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.sectionTitle}>Notatki</Text>
          <Text style={styles.notes}>{book.notes}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Link
          href={{ pathname: '/book/new', params: { id: book.id } }}
          asChild
        >
          <Pressable style={styles.action}>
            <Ionicons name="create-outline" size={18} color="#3B6EEA" />
            <Text style={styles.actionText}>Edytuj</Text>
          </Pressable>
        </Link>
        <Pressable style={[styles.action, styles.delete]} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={18} color="#c33" />
          <Text style={[styles.actionText, { color: '#c33' }]}>Usuń</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        {readers.length}{' '}
        {readers.length === 1
          ? 'osoba przeczytała tę książkę'
          : 'osób przeczytało tę książkę'}
      </Text>
      {readers.map((r) => (
        <View key={r.id} style={styles.readerRow}>
          <Pressable
            style={styles.readerInfo}
            onPress={() =>
              router.push({ pathname: '/user/[id]', params: { id: r.user_id } })
            }
          >
            <Ionicons name="person-circle" size={32} color="#3B6EEA" />
            <View style={{ flex: 1 }}>
              <Text style={styles.readerName}>{r.username}</Text>
              <Text style={styles.readerMeta}>
                Ocena: {r.rating ?? '—'} ·{' '}
                {new Date(r.date_added).toLocaleDateString('pl-PL')}
              </Text>
            </View>
          </Pressable>
          <Pressable
            disabled={r.isFollowed}
            onPress={() => follow(r.user_id)}
            style={[styles.followBtn, r.isFollowed && styles.followBtnDone]}
          >
            <Text
              style={[
                styles.followBtnText,
                r.isFollowed && { color: '#888' },
              ]}
            >
              {r.isFollowed ? 'Obserwujesz' : 'Obserwuj'}
            </Text>
          </Pressable>
        </View>
      ))}
      {readers.length === 0 && (
        <Text style={styles.empty}>Nikt inny jeszcze nie przeczytał tej książki.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  cover: { width: 100, height: 150, borderRadius: 6 },
  title: { fontSize: 20, fontWeight: '700' },
  author: { fontSize: 15, color: '#555' },
  status: { fontSize: 13, color: '#357', marginTop: 4 },
  notesBox: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  notes: { marginTop: 6, color: '#333' },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eef',
    borderRadius: 8,
  },
  delete: { backgroundColor: '#fee' },
  actionText: { color: '#3B6EEA', fontWeight: '600' },
  readerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  readerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  readerName: { fontWeight: '600' },
  readerMeta: { fontSize: 12, color: '#666' },
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#3B6EEA',
    borderRadius: 6,
  },
  followBtnDone: { backgroundColor: '#eee' },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  empty: { color: '#888', marginTop: 8 },
});
