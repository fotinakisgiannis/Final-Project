import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, NutritionGoals, UserStats } from '@/types/user';

interface UserState {
  profile: UserProfile | null;
  goals: NutritionGoals | null;
  stats: UserStats | null;
  waterToday: number;
  setProfile: (profile: UserProfile) => void;
  setGoals: (goals: NutritionGoals) => void;
  setStats: (stats: UserStats) => void;
  setWaterToday: (ml: number) => void;
  addWater: (ml: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      goals: null,
      stats: null,
      waterToday: 0,

      setProfile: (profile) => set({ profile }),
      setGoals: (goals) => set({ goals }),
      setStats: (stats) => set({ stats }),
      setWaterToday: (ml) => set({ waterToday: ml }),
      addWater: (ml) => set((state) => ({ waterToday: state.waterToday + ml })),
      clearUser: () => set({ profile: null, goals: null, stats: null, waterToday: 0 }),
    }),
    {
      name: 'nutritrack-user',
      partialize: (state) => ({ waterToday: state.waterToday }),
    }
  )
);
