'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Check } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { useFood } from '@/hooks/useFood';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { MealType } from '@/types/food';

interface VoiceLoggerProps {
  mealType: MealType;
  onLogged?: () => void;
}

export function VoiceLogger({ mealType, onLogged }: VoiceLoggerProps) {
  const { isListening, transcript, isProcessing, parseResult, startListening, stopListening, parseTranscript, reset } =
    useVoice();
  const { logFood, isSaving } = useFood();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      if (transcript) parseTranscript(transcript);
    } else {
      startListening();
    }
  };

  const handleLog = async () => {
    if (!parseResult) return;
    for (const food of parseResult.foods) {
      await logFood({
        foodName: food.name,
        mealType,
        servingSize: 1,
        servingUnit: food.quantity,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        source: 'VOICE',
      });
    }
    reset();
    onLogged?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <motion.button
          onClick={handleMicClick}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } } : {}}
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
            isListening
              ? 'bg-red-500 shadow-red-200'
              : 'bg-brand-500 hover:bg-brand-600 shadow-brand-200'
          )}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </motion.button>
        <p className="text-sm text-gray-500">
          {isListening ? 'Listening... tap to stop' : 'Tap mic and say what you ate'}
        </p>
      </div>

      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-1"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-brand-500 rounded-full"
              animate={{ height: [8, 24, 8] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      )}

      {transcript && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">You said:</p>
          <p className="text-sm text-gray-800 italic">&ldquo;{transcript}&rdquo;</p>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Parsing your meal...</span>
        </div>
      )}

      <AnimatePresence>
        {parseResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {parseResult.foods.map((food, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-brand-50 rounded-xl border border-brand-200">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{food.name}</p>
                  <p className="text-xs text-gray-500">{food.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-700">{food.calories} kcal</p>
                  <p className="text-xs text-gray-500">P{food.protein} C{food.carbs} F{food.fat}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <span className="text-base font-bold text-gray-900">{parseResult.totalCalories} kcal</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={reset}>Start over</Button>
              <Button onClick={handleLog} loading={isSaving}>
                <Check className="w-4 h-4" /> Log All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Try saying:</p>
        <div className="space-y-1">
          {['"I had 2 scrambled eggs and toast"', '"Large chicken salad with dressing"', '"Protein shake and a banana"'].map((ex) => (
            <p key={ex} className="text-xs text-gray-400 italic">{ex}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
