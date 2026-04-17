export const normalize = (s: string): string =>
  s.toLowerCase().trim().replace(/\s+/g, ' ');
