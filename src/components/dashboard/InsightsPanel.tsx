'use client';
import { motion } from 'framer-motion';
import { useDashboardStore } from '@/store/useDashboardStore';
import type { NutritionInsight } from '@/types/analytics';

const typeStyles: Record<NutritionInsight['type'], { bg: string; border: string; text: string }> = {
  success: { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  tip: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
};

export function InsightsPanel() {
  const { insights } = useDashboardStore();

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => {
        const styles = typeStyles[insight.type];
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex gap-3 p-4 rounded-xl border ${styles.bg} ${styles.border}`}
          >
            <span className="text-xl">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${styles.text}`}>{insight.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{insight.message}</p>
              {insight.actionable && (
                <p className="text-xs text-gray-500 mt-1 italic">→ {insight.actionable}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
