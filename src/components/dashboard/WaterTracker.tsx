'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';

const QUICK_AMOUNTS = [150, 250, 330, 500];

export function WaterTracker() {
  const { waterToday, goals, addWater } = useUserStore();
  const goalMl = goals?.water ?? 2500;
  const pct = Math.min(100, (waterToday / goalMl) * 100);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddWater = async (ml: number) => {
    setIsAdding(true);
    try {
      const res = await fetch('/api/log/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl: ml }),
      });
      if (!res.ok) throw new Error();
      addWater(ml);
      toast.success(`+${ml}ml added!`);
    } catch {
      toast.error('Failed to log water');
    } finally {
      setIsAdding(false);
    }
  };

  const cups = Math.floor(waterToday / 250);
  const totalCups = Math.ceil(goalMl / 250);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-900">Hydration</span>
        </div>
        <span className="text-sm text-gray-500">
          {(waterToday / 1000).toFixed(1)}L / {(goalMl / 1000).toFixed(1)}L
        </span>
      </div>

      {/* Visual cups */}
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: totalCups }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-7 h-8 rounded-lg border-2 transition-colors duration-300 ${
              i < cups ? 'bg-blue-400 border-blue-400' : 'border-gray-200'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Quick add buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            onClick={() => handleAddWater(ml)}
            disabled={isAdding}
            className="flex flex-col items-center gap-1 py-2.5 px-1 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">{ml}ml</span>
          </button>
        ))}
      </div>
    </div>
  );
}
