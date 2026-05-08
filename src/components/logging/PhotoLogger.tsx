'use client';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RefreshCw, Check, X } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useFood } from '@/hooks/useFood';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { MealType } from '@/types/food';

interface PhotoLoggerProps {
  mealType: MealType;
  onLogged?: () => void;
}

export function PhotoLogger({ mealType, onLogged }: PhotoLoggerProps) {
  const { preview, isAnalyzing, analysis, fileInputRef, handleFileSelect, analyzePhoto, reset } = useCamera();
  const { logFood, isSaving } = useFood();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileSelect(file);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      await analyzePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleLog = async () => {
    if (!analysis) return;
    const foods = analysis.foods.filter((_, i) => selected.size === 0 || selected.has(i));
    for (const food of foods) {
      await logFood({
        foodName: food.name,
        mealType,
        servingSize: 1,
        servingUnit: food.servingDescription,
        calories: food.estimatedCalories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        source: 'AI_PHOTO',
        aiConfidence: food.confidence,
      });
    }
    reset();
    onLogged?.();
  };

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInput}
      />

      {!preview ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 p-6 bg-gray-50 hover:bg-brand-50 border-2 border-dashed border-gray-200 hover:border-brand-300 rounded-2xl transition-all"
          >
            <Camera className="w-8 h-8 text-brand-500" />
            <span className="text-sm font-medium text-gray-700">Take Photo</span>
          </button>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }
            }}
            className="flex flex-col items-center gap-3 p-6 bg-gray-50 hover:bg-brand-50 border-2 border-dashed border-gray-200 hover:border-brand-300 rounded-2xl transition-all"
          >
            <Upload className="w-8 h-8 text-brand-500" />
            <span className="text-sm font-medium text-gray-700">Upload Image</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={preview} alt="Food" className="w-full h-48 object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm font-medium">Analyzing food...</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm font-semibold text-gray-700">Detected foods (tap to select):</p>
                {analysis.foods.map((food, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selected.has(i) || selected.size === 0
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.servingDescription}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{food.estimatedCalories} kcal</p>
                        <p className="text-xs text-gray-500">
                          P {food.protein}g C {food.carbs}g F {food.fat}g
                        </p>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-400 rounded-full"
                          style={{ width: `${food.confidence * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{Math.round(food.confidence * 100)}% confident</p>
                    </div>
                  </button>
                ))}

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={reset} size="md">
                    <RefreshCw className="w-4 h-4" /> Retake
                  </Button>
                  <Button onClick={handleLog} loading={isSaving} size="md">
                    <Check className="w-4 h-4" /> Log Food
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
