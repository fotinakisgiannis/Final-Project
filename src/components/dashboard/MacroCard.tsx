'use client';
import { motion } from 'framer-motion';

interface MacroCardProps {
  label: string;
  consumed: number;
  goal: number;
  unit?: string;
  color: string;
  bgColor: string;
}

export function MacroCard({ label, consumed, goal, unit = 'g', color, bgColor }: MacroCardProps) {
  const pct = Math.min(100, goal > 0 ? (consumed / goal) * 100 : 0);

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="text-xs text-gray-400">{Math.round(consumed)}/{goal}{unit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div
        className="text-center py-2 rounded-xl"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-lg font-bold" style={{ color }}>
          {Math.round(consumed)}{unit}
        </span>
      </div>
    </div>
  );
}
