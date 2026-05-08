'use client';
import { motion } from 'framer-motion';

interface NutritionScoreProps {
  score: number;
}

export function NutritionScore({ score }: NutritionScoreProps) {
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#22c55e', text: 'text-brand-600', label: 'Excellent' };
    if (s >= 60) return { stroke: '#f59e0b', text: 'text-amber-600', label: 'Good' };
    if (s >= 40) return { stroke: '#f97316', text: 'text-orange-600', label: 'Fair' };
    return { stroke: '#ef4444', text: 'text-red-600', label: 'Needs work' };
  };

  const { stroke, text, label } = getColor(score);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="#f3f4f6" strokeWidth="6" fill="none" />
          <motion.circle
            cx="32" cy="32" r={radius}
            stroke={stroke}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${text}`}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">Nutrition Score</p>
        <p className={`text-xs font-medium ${text}`}>{label}</p>
      </div>
    </div>
  );
}
