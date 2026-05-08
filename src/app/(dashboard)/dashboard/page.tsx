'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { RefreshCw, Flame, Droplets, Zap, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CalorieRing } from '@/components/dashboard/CalorieRing';
import { MacroCard } from '@/components/dashboard/MacroCard';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { WeightChart } from '@/components/dashboard/WeightChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { MealTimeline } from '@/components/dashboard/MealTimeline';
import { NutritionScore } from '@/components/dashboard/NutritionScore';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useUserStore } from '@/store/useUserStore';
import { useDashboard } from '@/hooks/useDashboard';
import { useFood } from '@/hooks/useFood';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { goals, stats, waterToday } = useUserStore();
  const { getDayTotals, isLoading } = useNutritionStore();
  const { loadTodayEntries } = useFood();
  const { isRefreshing, loadDashboardData } = useDashboard();

  useEffect(() => {
    loadTodayEntries();
  }, [loadTodayEntries]);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile) useUserStore.getState().setProfile(d.profile);
      if (d.stats) useUserStore.getState().setStats(d.stats);
      if (d.profile) {
        useUserStore.getState().setGoals({
          calories: d.profile.dailyCalorieGoal ?? 2000,
          protein: d.profile.dailyProteinG ?? 150,
          carbs: d.profile.dailyCarbsG ?? 200,
          fat: d.profile.dailyFatG ?? 65,
          fiber: d.profile.dailyFiberG ?? 28,
          water: d.profile.dailyWaterMl ?? 2500,
        });
      }
    }).catch(console.error);
  }, []);

  const totals = getDayTotals();
  const today = format(new Date(), 'EEEE, MMMM d');
  const calorieGoal = goals?.calories ?? 2000;
  const proteinGoal = goals?.protein ?? 150;
  const carbsGoal = goals?.carbs ?? 200;
  const fatGoal = goals?.fat ?? 65;
  const nutritionScore = calorieGoal > 0
    ? Math.round(Math.min(100, 60 + (totals.calories / calorieGoal) * 40))
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-gray-500">{today}</p>
          <h1 className="text-xl font-bold text-gray-900">
            Hey, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {stats?.currentStreak ? (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">{stats.currentStreak}d</span>
            </div>
          ) : null}
          <button
            onClick={loadDashboardData}
            disabled={isRefreshing}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Calorie Ring */}
      <Card className="flex flex-col items-center py-6">
        <CalorieRing consumed={totals.calories} goal={calorieGoal} size={200} />
        <div className="flex gap-2 mt-4">
          <NutritionScore score={nutritionScore} />
        </div>
      </Card>

      {/* Macros */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-4">Today&apos;s Macros</p>
        <div className="flex gap-4">
          <MacroCard label="Protein" consumed={totals.protein} goal={proteinGoal} color="#3b82f6" bgColor="#eff6ff" />
          <MacroCard label="Carbs" consumed={totals.carbs} goal={carbsGoal} color="#f59e0b" bgColor="#fffbeb" />
          <MacroCard label="Fat" consumed={totals.fat} goal={fatGoal} color="#ef4444" bgColor="#fef2f2" />
        </div>
      </Card>

      {/* Quick Log FAB */}
      <button
        onClick={() => router.push('/log')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-glow-green flex items-center justify-center transition-all z-30"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Water */}
      <Card>
        <WaterTracker />
      </Card>

      {/* AI Insights */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">🤖 AI Insights</h2>
        <InsightsPanel />
      </div>

      {/* Meal Timeline */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Today&apos;s Meals</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <MealTimeline />
        )}
      </Card>

      {/* Weight Chart */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Weight Trend</h2>
        <WeightChart />
      </Card>
    </div>
  );
}
