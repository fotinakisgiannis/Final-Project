'use client';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useFood } from '@/hooks/useFood';
import { getMealTypeEmoji, getMealTypeLabel, formatCalories } from '@/lib/utils';
import type { MealType } from '@/types/food';

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT'];

export function MealTimeline() {
  const { todayEntries } = useNutritionStore();
  const { deleteEntry } = useFood();

  const grouped = MEAL_ORDER.reduce<Record<string, typeof todayEntries>>((acc, mealType) => {
    const entries = todayEntries.filter((e) => e.mealType === mealType);
    if (entries.length > 0) acc[mealType] = entries;
    return acc;
  }, {});

  if (todayEntries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-4xl mb-2">🍽️</p>
        <p className="text-sm">No meals logged yet today.</p>
        <p className="text-xs mt-1">Tap the + button to add a meal!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([mealType, entries]) => {
        const mealCalories = entries.reduce((s, e) => s + e.calories, 0);
        return (
          <div key={mealType}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getMealTypeEmoji(mealType)}</span>
                <span className="text-sm font-semibold text-gray-800">{getMealTypeLabel(mealType)}</span>
              </div>
              <span className="text-xs text-gray-500">{formatCalories(mealCalories)} kcal</span>
            </div>
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{entry.foodName}</p>
                    {entry.brand && <p className="text-xs text-gray-400">{entry.brand}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {entry.servingSize} {entry.servingUnit} • P {Math.round(entry.protein)}g • C {Math.round(entry.carbs)}g • F {Math.round(entry.fat)}g
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-sm font-semibold text-gray-700">{Math.round(entry.calories)}</span>
                    <button
                      onClick={() => deleteEntry(entry.id, entry.foodName)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
