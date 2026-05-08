'use client';
import { useState, useCallback } from 'react';
import { useNutritionStore } from '@/store/useNutritionStore';
import type { FoodLogEntry, MealType } from '@/types/food';
import toast from 'react-hot-toast';

export function useFood() {
  const { addEntry, removeEntry, setTodayEntries, setLoading } = useNutritionStore();
  const [isSaving, setIsSaving] = useState(false);

  const loadTodayEntries = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const params = date ? `?date=${date}` : '';
      const res = await fetch(`/api/log/meals${params}`);
      if (!res.ok) throw new Error('Failed to load entries');
      const data = await res.json();
      setTodayEntries(data.entries ?? []);
    } catch (error) {
      console.error('Failed to load food entries:', error);
      toast.error('Failed to load food log');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTodayEntries]);

  const logFood = useCallback(
    async (food: Omit<FoodLogEntry, 'id' | 'userId' | 'loggedAt'> & { mealType: MealType }) => {
      setIsSaving(true);
      try {
        const res = await fetch('/api/log/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(food),
        });
        if (!res.ok) throw new Error('Failed to log food');
        const data = await res.json();
        addEntry(data.entry);
        toast.success(`${food.foodName} logged!`);
        return data.entry as FoodLogEntry;
      } catch (error) {
        console.error('Failed to log food:', error);
        toast.error('Failed to log food');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [addEntry]
  );

  const deleteEntry = useCallback(
    async (id: string, foodName: string) => {
      try {
        const res = await fetch(`/api/log/meals?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete entry');
        removeEntry(id);
        toast.success(`${foodName} removed`);
      } catch (error) {
        console.error('Failed to delete entry:', error);
        toast.error('Failed to remove entry');
      }
    },
    [removeEntry]
  );

  const searchFood = useCallback(async (query: string) => {
    if (query.length < 2) return [];
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.results ?? [];
    } catch {
      return [];
    }
  }, []);

  return { loadTodayEntries, logFood, deleteEntry, searchFood, isSaving };
}
