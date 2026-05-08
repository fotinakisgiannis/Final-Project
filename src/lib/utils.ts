import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString();
}

export function formatMacro(grams: number): string {
  return `${Math.round(grams)}g`;
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') return `${Math.round(kg * 2.20462 * 10) / 10} lbs`;
  return `${Math.round(kg * 10) / 10} kg`;
}

export function percentageOf(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export function getMealTypeEmoji(mealType: string): string {
  const emojis: Record<string, string> = {
    BREAKFAST: '🍳',
    LUNCH: '🍲',
    DINNER: '🍽️',
    SNACK: '🥐',
    PRE_WORKOUT: '💪',
    POST_WORKOUT: '🧀',
  };
  return emojis[mealType] ?? '🍴';
}

export function getMealTypeLabel(mealType: string): string {
  return mealType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function getActivityLabel(level: string): string {
  const labels: Record<string, string> = {
    SEDENTARY: 'Sedentary (little to no exercise)',
    LIGHTLY_ACTIVE: 'Lightly Active (1-3 days/week)',
    MODERATELY_ACTIVE: 'Moderately Active (3-5 days/week)',
    VERY_ACTIVE: 'Very Active (6-7 days/week)',
    EXTRA_ACTIVE: 'Extra Active (athlete, physical job)',
  };
  return labels[level] ?? level;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
