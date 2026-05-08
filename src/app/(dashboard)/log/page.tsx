'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Barcode, Search, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PhotoLogger } from '@/components/logging/PhotoLogger';
import { VoiceLogger } from '@/components/logging/VoiceLogger';
import { BarcodeScanner } from '@/components/logging/BarcodeScanner';
import { FoodSearch } from '@/components/logging/FoodSearch';
import { MealTimeline } from '@/components/dashboard/MealTimeline';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useFood } from '@/hooks/useFood';
import { useEffect } from 'react';
import type { MealType } from '@/types/food';

type LogMethod = 'photo' | 'voice' | 'barcode' | 'search';

const LOG_METHODS = [
  { id: 'photo' as LogMethod, icon: Camera, label: 'Photo AI', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'voice' as LogMethod, icon: Mic, label: 'Voice', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'barcode' as LogMethod, icon: Barcode, label: 'Barcode', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'search' as LogMethod, icon: Search, label: 'Search', color: 'text-orange-600', bg: 'bg-orange-50' },
];

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT'];

export default function LogPage() {
  const [method, setMethod] = useState<LogMethod>('photo');
  const [mealType, setMealType] = useState<MealType>('SNACK');
  const [mealMenuOpen, setMealMenuOpen] = useState(false);
  const { loadTodayEntries } = useFood();

  useEffect(() => {
    loadTodayEntries();
  }, [loadTodayEntries]);

  const getMealEmoji = (m: MealType) => ({ BREAKFAST: '🍳', LUNCH: '🍲', DINNER: '🍽️', SNACK: '🥐', PRE_WORKOUT: '💪', POST_WORKOUT: '🧀' }[m]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Log Food</h1>
        <div className="relative">
          <button
            onClick={() => setMealMenuOpen(!mealMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium shadow-sm"
          >
            <span>{getMealEmoji(mealType)}</span>
            <span>{mealType.replace('_', ' ')}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {mealMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-card-hover border border-gray-100 py-1 z-20 min-w-[160px]">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  onClick={() => { setMealType(m); setMealMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 ${
                    m === mealType ? 'text-brand-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span>{getMealEmoji(m)}</span>
                  <span>{m.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-4 gap-2">
        {LOG_METHODS.map(({ id, icon: Icon, label, color, bg }) => (
          <motion.button
            key={id}
            onClick={() => setMethod(id)}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
              method === id
                ? 'border-brand-400 bg-brand-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl ${method === id ? 'bg-brand-100' : bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${method === id ? 'text-brand-600' : color}`} />
            </div>
            <span className={`text-xs font-medium ${method === id ? 'text-brand-700' : 'text-gray-600'}`}>
              {label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Logger component */}
      <Card>
        {method === 'photo' && <PhotoLogger mealType={mealType} onLogged={loadTodayEntries} />}
        {method === 'voice' && <VoiceLogger mealType={mealType} onLogged={loadTodayEntries} />}
        {method === 'barcode' && <BarcodeScanner mealType={mealType} onLogged={loadTodayEntries} />}
        {method === 'search' && <FoodSearch mealType={mealType} onLogged={loadTodayEntries} />}
      </Card>

      {/* Today timeline */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Today&apos;s Log</h2>
        <MealTimeline />
      </Card>
    </div>
  );
}
