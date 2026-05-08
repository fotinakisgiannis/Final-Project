'use client';
import { useCallback, useEffect } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUserStore } from '@/store/useUserStore';
import type { NutritionInsight } from '@/types/analytics';

export function useDashboard() {
  const { insights, weeklyData, isRefreshing, setInsights, setWeeklyData, setRefreshing, setLastRefresh } =
    useDashboardStore();
  const { profile, goals, setStats } = useUserStore();

  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [analyticsRes, profileRes] = await Promise.all([
        fetch('/api/analytics?period=week'),
        fetch('/api/profile'),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setWeeklyData(analyticsData.dailyData ?? []);

        const generatedInsights: NutritionInsight[] = [];
        const avgCalories = analyticsData.avgCalories ?? 0;
        const calGoal = goals?.calories ?? 2000;

        if (avgCalories < calGoal * 0.8) {
          generatedInsights.push({
            id: '1',
            type: 'warning',
            title: 'Undereating detected',
            message: `You're averaging ${Math.round(avgCalories)} kcal, ${Math.round(calGoal - avgCalories)} below your goal.`,
            icon: '⚡',
            actionable: 'Add a protein-rich snack between meals.',
          });
        } else if (avgCalories > calGoal * 1.1) {
          generatedInsights.push({
            id: '2',
            type: 'warning',
            title: 'Calorie surplus',
            message: `You're averaging ${Math.round(avgCalories - calGoal)} kcal over your goal this week.`,
            icon: '📊',
            actionable: 'Consider smaller portions at dinner.',
          });
        } else {
          generatedInsights.push({
            id: '3',
            type: 'success',
            title: 'On track!',
            message: 'Your calorie intake is spot on this week. Great consistency!',
            icon: '🎯',
          });
        }

        if ((analyticsData.avgWater ?? 0) < (goals?.water ?? 2000)) {
          generatedInsights.push({
            id: '4',
            type: 'info',
            title: 'Hydration reminder',
            message: 'You drink less water than your daily goal. Try carrying a water bottle.',
            icon: '💧',
            actionable: 'Set a reminder every 2 hours to drink water.',
          });
        }

        setInsights(generatedInsights);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.stats) setStats(profileData.stats);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [goals, setInsights, setLastRefresh, setRefreshing, setStats, setWeeklyData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return { insights, weeklyData, isRefreshing, profile, goals, loadDashboardData };
}
