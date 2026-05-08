'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NutritionChart } from '@/components/analytics/NutritionChart';
import { MacroBreakdown } from '@/components/analytics/MacroBreakdown';
import { useUserStore } from '@/store/useUserStore';
import { BarChart2, TrendingDown, Droplets, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsData {
  dailyData: { date: string; calories: number; protein: number; carbs: number; fat: number; water: number }[];
  avgCalories: number;
  avgProtein: number;
  avgWater: number;
  loggingDays: number;
  calorieGoalHitDays: number;
  proteinGoalHitDays: number;
  waterGoalHitDays: number;
  weightChange?: number;
  insights: string[];
  weeklySummary?: string;
  goals: { calories: number; protein: number; water: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [activeMetric, setActiveMetric] = useState<'calories' | 'protein' | 'water'>('calories');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [period]);

  const avgTotals = data
    ? {
        protein: Math.round(data.dailyData.reduce((s, d) => s + d.protein, 0) / (data.loggingDays || 1)),
        carbs: Math.round(data.dailyData.reduce((s, d) => s + d.carbs, 0) / (data.loggingDays || 1)),
        fat: Math.round(data.dailyData.reduce((s, d) => s + d.fat, 0) / (data.loggingDays || 1)),
      }
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === 'week' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: BarChart2, label: 'Avg Calories', value: data ? `${data.avgCalories}` : '--', unit: 'kcal', color: 'text-brand-600', bg: 'bg-brand-50' },
          { icon: Dumbbell, label: 'Avg Protein', value: data ? `${data.avgProtein}` : '--', unit: 'g', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Droplets, label: 'Avg Water', value: data ? `${(data.avgWater / 1000).toFixed(1)}` : '--', unit: 'L', color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { icon: TrendingDown, label: 'Days Logged', value: data ? `${data.loggingDays}` : '--', unit: `/ ${period === 'week' ? 7 : 30}`, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ icon: Icon, label, value, unit, color, bg }) => (
          <Card key={label} padding="sm">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span></p>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <div className="flex gap-2 mb-4">
          {(['calories', 'protein', 'water'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeMetric === m ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
        ) : data ? (
          <NutritionChart
            data={data.dailyData.map(d => ({ date: format(new Date(d.date), 'M/d'), calories: d.calories, protein: d.protein, water: d.water }))}
            metric={activeMetric}
            goal={activeMetric === 'calories' ? data.goals.calories : activeMetric === 'protein' ? data.goals.protein : data.goals.water}
          />
        ) : null}
      </Card>

      {/* Goal achievement */}
      {data && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-4">Goal Achievement</p>
          <div className="space-y-3">
            {[
              { label: 'Calorie Goal', hit: data.calorieGoalHitDays, total: data.loggingDays, color: 'bg-brand-500' },
              { label: 'Protein Goal', hit: data.proteinGoalHitDays, total: data.loggingDays, color: 'bg-blue-500' },
              { label: 'Water Goal', hit: data.waterGoalHitDays, total: data.loggingDays, color: 'bg-cyan-500' },
            ].map(({ label, hit, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-900">{hit}/{total} days</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: total > 0 ? `${(hit / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Macro breakdown */}
      {avgTotals && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-4">Avg Macro Breakdown</p>
          <MacroBreakdown protein={avgTotals.protein} carbs={avgTotals.carbs} fat={avgTotals.fat} />
        </Card>
      )}

      {/* AI Insights */}
      {data?.weeklySummary && (
        <Card className="bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-100">
          <p className="text-xs font-semibold text-brand-600 mb-2">🤖 AI Weekly Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">{data.weeklySummary}</p>
        </Card>
      )}

      {data?.insights?.length ? (
        <div className="space-y-3">
          {data.insights.map((insight, i) => (
            <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-lg">✨</span>
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
