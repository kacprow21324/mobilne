import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';

type FollowedProfile = { user_id: string; username: string; follow_id: string };

type FollowRow = {
  id: string;
  following_id: string;
  profiles: { username: string } | { username: string }[] | null;
};

function readUsername(profiles: FollowRow['profiles']): string {
  if (!profiles) return '(nieznany)';
  if (Array.isArray(profiles)) return profiles[0]?.username ?? '(nieznany)';
  return profiles.username;
}

export default function Following() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [rows, setRows] = useState<FollowedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_follows')
      .select('id, following_id, profiles:following_id(username)')
      .eq('follower_id', currentUser.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Błąd', text2: error.message });
      return;
    }
    const mapped: FollowedProfile[] = (data ?? []).map((r: FollowRow) => ({
      user_id: r.following_id,
      username: readUsername(r.profiles),
      follow_id: r.id,
    }));
    setRows(mapped);
  }, [currentUser]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function unfollow(followId: string) {
    const { error } = await supabase.from('user_follows').delete().eq('id', followId);
    if (error) {
      Toast.show({ type: 'error', text1: 'Nie udało się', text2: error.message });
      return;
    }
    Toast.show({ type: 'success', text1: 'Przestałeś obserwować' });
    setRows((prev) => prev.filter((r) => r.follow_id !== followId));
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 16, gap: 8 }}
      data={rows}
      keyExtractor={(r) => r.follow_id}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() =>
            router.push({ pathname: '/user/[id]', params: { id: item.user_id } })
          }
        >
          <Ionicons name="person-circle" size={36} color="#3B6EEA" />
          <Text style={styles.username}>{item.username}</Text>
          <Pressable onPress={() => unfollow(item.follow_id)} style={styles.unfollow}>
            <Text style={styles.unfollowText}>Przestań obserwować</Text>
          </Pressable>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>Nikogo jeszcze nie obserwujesz.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  username: { flex: 1, fontSize: 16, fontWeight: '500' },
  unfollow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fee',
    borderRadius: 6,
  },
  unfollowText: { color: '#c33', fontSize: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
