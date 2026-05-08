import { create } from 'zustand';
import type { NutritionInsight } from '@/types/analytics';

interface DashboardState {
  insights: NutritionInsight[];
  weeklyData: { date: string; calories: number; protein: number; water: number }[];
  isRefreshing: boolean;
  lastRefresh: Date | null;
  setInsights: (insights: NutritionInsight[]) => void;
  setWeeklyData: (data: { date: string; calories: number; protein: number; water: number }[]) => void;
  setRefreshing: (val: boolean) => void;
  setLastRefresh: (date: Date) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  insights: [],
  weeklyData: [],
  isRefreshing: false,
  lastRefresh: null,

  setInsights: (insights) => set({ insights }),
  setWeeklyData: (weeklyData) => set({ weeklyData }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setLastRefresh: (lastRefresh) => set({ lastRefresh }),
}));
