import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/useAuthStore';

export default function Index() {
  const currentUser = useAuthStore((s) => s.currentUser);
  return <Redirect href={currentUser ? '/library' : '/login'} />;
}
