export type BookStatus = 'to_read' | 'reading' | 'finished';

export const STATUS_LABELS: Record<BookStatus, string> = {
  to_read: 'Chcę przeczytać',
  reading: 'Czytam',
  finished: 'Przeczytane',
};

export const STATUS_OPTIONS: BookStatus[] = ['to_read', 'reading', 'finished'];

export const STATUS_GROUP_ORDER: Record<BookStatus, number> = {
  reading: 0,
  to_read: 1,
  finished: 2,
};
