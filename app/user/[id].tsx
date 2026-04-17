import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { BookRow } from '@/components/BookRow';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { PublicFinishedBook } from '@/types/db';

export default function OtherUserBooks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [username, setUsername] = useState<string>('');
  const [books, setBooks] = useState<PublicFinishedBook[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: profile }, { data: booksData, error }] = await Promise.all([
      supabase.from('profiles').select('username').eq('id', id).single(),
      supabase
        .from('public_finished_books')
        .select('*')
        .eq('user_id', id)
        .order('date_added', { ascending: false }),
    ]);
    setUsername(profile?.username ?? '');
    if (error) {
      Toast.show({ type: 'error', text1: 'Błąd', text2: error.message });
    } else {
      setBooks((booksData ?? []) as PublicFinishedBook[]);
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function quickAdd(book: PublicFinishedBook) {
    if (!currentUser) return;
    const { error } = await supabase.from('books').insert({
      user_id: currentUser.id,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      status: 'to_read',
    });
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Nie udało się dodać',
        text2: error.message,
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Dodano do Twojej listy',
      text2: `${book.title} — Chcę przeczytać`,
    });
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <Text style={styles.header}>Przeczytane przez: {username || '—'}</Text>
      <FlatList
        data={books}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <BookRow
            title={item.title}
            author={item.author}
            coverUrl={item.cover_url}
            rating={item.rating}
            rightSlot={
              <Pressable onPress={() => quickAdd(item)} style={styles.addBtn}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addBtnText}>Dodaj</Text>
              </Pressable>
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Brak przeczytanych książek.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 16, fontWeight: '600', padding: 16 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B6EEA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
