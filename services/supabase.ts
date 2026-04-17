import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const serverMemoryStorage = {
  data: new Map<string, string>(),
  getItem(key: string) {
    return Promise.resolve(this.data.get(key) ?? null);
  },
  setItem(key: string, value: string) {
    this.data.set(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    this.data.delete(key);
    return Promise.resolve();
  },
};

const authStorage = isReactNative ? AsyncStorage : isBrowser ? undefined : serverMemoryStorage;

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your project credentials.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: isReactNative,
    persistSession: isReactNative || isBrowser,
    detectSessionInUrl: false,
  },
});
