import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoodLogEntry, MealType } from '@/types/food';

interface NutritionState {
  todayEntries: FoodLogEntry[];
  selectedDate: string;
  isLoading: boolean;
  setTodayEntries: (entries: FoodLogEntry[]) => void;
  addEntry: (entry: FoodLogEntry) => void;
  removeEntry: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setLoading: (loading: boolean) => void;
  getTotalsByMeal: (mealType: MealType) => { calories: number; protein: number; carbs: number; fat: number };
  getDayTotals: () => { calories: number; protein: number; carbs: number; fat: number; fiber: number };
}

export const useNutritionStore = create<NutritionState>()((
  set,
  get
) => ({
  todayEntries: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,

  setTodayEntries: (entries) => set({ todayEntries: entries }),

  addEntry: (entry) =>
    set((state) => ({ todayEntries: [...state.todayEntries, entry] })),

  removeEntry: (id) =>
    set((state) => ({ todayEntries: state.todayEntries.filter((e) => e.id !== id) })),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setLoading: (loading) => set({ isLoading: loading }),

  getTotalsByMeal: (mealType) => {
    const entries = get().todayEntries.filter((e) => e.mealType === mealType);
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },

  getDayTotals: () => {
    const entries = get().todayEntries;
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
        fiber: acc.fiber + (e.fiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  },
}));
