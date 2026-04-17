import type { BookStatus } from '@/lib/status';

export type Profile = {
  id: string;
  username: string;
  created_at: string;
};

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  status: BookStatus;
  rating: number | null;
  notes: string | null;
  date_added: string;
  title_normalized: string;
  author_normalized: string;
};

export type PublicFinishedBook = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  rating: number | null;
  date_added: string;
  title_normalized: string;
  author_normalized: string;
};

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};
