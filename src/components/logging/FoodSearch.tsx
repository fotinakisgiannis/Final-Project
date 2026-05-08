'use client';
import { useState, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useFood } from '@/hooks/useFood';
import { debounce } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { MealType } from '@/types/food';

interface FoodResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: number;
  servingUnit: string;
}

interface FoodSearchProps {
  mealType: MealType;
  onLogged?: () => void;
}

export function FoodSearch({ mealType, onLogged }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { logFood, searchFood, isSaving } = useFood();

  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setResults([]); return; }
      setIsSearching(true);
      const found = await searchFood(q) as FoodResult[];
      setResults(found);
      setIsSearching(false);
    }, 400),
    [searchFood]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  const handleLog = async (food: FoodResult) => {
    await logFood({
      foodName: food.name,
      brand: food.brand,
      mealType,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      source: 'USDA',
    });
    setQuery('');
    setResults([]);
    onLogged?.();
  };

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={handleChange}
        placeholder="Search foods (USDA database)..."
        leftIcon={<Search className="w-4 h-4" />}
      />

      {isSearching && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Searching...</span>
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 max-h-80 overflow-y-auto"
          >
            {results.map((food, i) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{food.name}</p>
                  <p className="text-xs text-gray-400">{food.calories} kcal • P{food.protein}g • C{food.carbs}g • F{food.fat}g</p>
                  <p className="text-xs text-gray-300">per {food.servingSize}{food.servingUnit}</p>
                </div>
                <button
                  onClick={() => handleLog(food)}
                  disabled={isSaving}
                  className="ml-3 p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {query.length >= 2 && !isSearching && results.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">No results found for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}
