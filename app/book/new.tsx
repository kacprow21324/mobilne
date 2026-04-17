import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { StarRating } from '@/components/StarRating';
import { StatusPicker } from '@/components/StatusPicker';
import type { BookStatus } from '@/lib/status';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { Book } from '@/types/db';

export default function AddOrEditBook() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<BookStatus>('to_read');
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single<Book>();
      if (error || !data) {
        Toast.show({ type: 'error', text1: 'Nie znaleziono książki' });
        setLoading(false);
        return;
      }
      setTitle(data.title);
      setAuthor(data.author);
      setStatus(data.status);
      setRating(data.rating);
      setNotes(data.notes ?? '');
      setCoverUrl(data.cover_url ?? '');
      setLoading(false);
    })();
  }, [editing, id]);

  async function save() {
    if (!currentUser) return;
    if (!title.trim() || !author.trim()) {
      Toast.show({ type: 'error', text1: 'Tytuł i autor są wymagane' });
      return;
    }
    setSaving(true);
    const payload = {
      user_id: currentUser.id,
      title: title.trim(),
      author: author.trim(),
      status,
      rating: status === 'finished' ? rating : null,
      notes: notes.trim() ? notes.trim() : null,
      cover_url: coverUrl.trim() ? coverUrl.trim() : null,
    };
    const { error } =
      editing && id
        ? await supabase.from('books').update(payload).eq('id', id)
        : await supabase.from('books').insert(payload);
    setSaving(false);
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Zapis nie powiódł się',
        text2: error.message,
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: editing ? 'Zapisano zmiany' : 'Dodano książkę',
    });
    router.back();
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.label}>Tytuł</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Autor</Text>
      <TextInput style={styles.input} value={author} onChangeText={setAuthor} />

      <Text style={styles.label}>URL okładki (opcjonalnie)</Text>
      <TextInput
        style={styles.input}
        value={coverUrl}
        onChangeText={setCoverUrl}
        autoCapitalize="none"
        placeholder="https://..."
      />

      <Text style={styles.label}>Status</Text>
      <StatusPicker value={status} onChange={setStatus} />

      <Text style={styles.label}>
        Ocena {status === 'finished' ? '' : '(dostępna dla statusu „Przeczytane")'}
      </Text>
      <StarRating
        value={rating}
        onChange={status === 'finished' ? setRating : undefined}
        disabled={status !== 'finished'}
      />

      <Text style={styles.label}>Notatki</Text>
      <TextInput
        style={[styles.input, styles.notes]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={styles.button} onPress={save} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {editing ? 'Zapisz zmiany' : 'Dodaj książkę'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 8, backgroundColor: '#F3F4F6' },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  notes: { minHeight: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#3B6EEA',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
