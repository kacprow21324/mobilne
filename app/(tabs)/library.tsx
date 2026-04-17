import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { BookRow } from '@/components/BookRow';
import { STATUS_GROUP_ORDER, STATUS_LABELS, type BookStatus } from '@/lib/status';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { Book } from '@/types/db';

export default function Library() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date_added', { ascending: false });
    setLoading(false);
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Nie udało się pobrać książek',
        text2: error.message,
      });
      return;
    }
    setBooks((data ?? []) as Book[]);
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const finishedThisYear = useMemo(() => {
    const year = new Date().getFullYear();
    return books.filter(
      (b) => b.status === 'finished' && new Date(b.date_added).getFullYear() === year,
    ).length;
  }, [books]);

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? books.filter(
          (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q),
        )
      : books;
    const groups = new Map<BookStatus, Book[]>();
    for (const b of filtered) {
      const arr = groups.get(b.status) ?? [];
      arr.push(b);
      groups.set(b.status, arr);
    }
    return Array.from(groups.entries())
      .sort((a, b) => STATUS_GROUP_ORDER[a[0]] - STATUS_GROUP_ORDER[b[0]])
      .map(([status, data]) => ({ title: STATUS_LABELS[status], data }));
  }, [books, search]);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.counter}>Przeczytane w tym roku: {finishedThisYear}</Text>
        <Pressable onPress={signOut} hitSlop={8}>
          <Ionicons name="log-out-outline" size={24} color="#555" />
        </Pressable>
      </View>
      <TextInput
        style={styles.search}
        placeholder="Szukaj po tytule lub autorze"
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.section}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <BookRow
              title={item.title}
              author={item.author}
              coverUrl={item.cover_url}
              rating={item.rating}
              onPress={() =>
                router.push({ pathname: '/book/[id]', params: { id: item.id } })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search ? 'Brak wyników.' : 'Dodaj pierwszą książkę przyciskiem poniżej.'}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          stickySectionHeadersEnabled={false}
        />
      )}
      <Pressable style={styles.fab} onPress={() => router.push('/book/new')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: { fontSize: 18, fontWeight: '600' },
  search: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, paddingHorizontal: 24 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B6EEA',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
});
