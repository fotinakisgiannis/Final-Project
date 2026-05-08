'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface AchievementsResponse {
  achievements: Achievement[];
  totalPoints: number;
  unlockedCount: number;
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    fetch('/api/achievements')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = data?.achievements.filter((a) => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Achievements</h1>
      </div>

      {/* Summary */}
      {data && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.totalPoints} pts</p>
              <p className="text-sm text-gray-600">{data.unlockedCount} / {data.achievements.length} unlocked</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unlocked', 'locked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered?.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`flex items-center gap-4 ${
                  ach.isUnlocked ? '' : 'opacity-50 grayscale'
                }`}
                padding="md"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                  ach.isUnlocked ? 'bg-yellow-50' : 'bg-gray-100'
                }`}>
                  {ach.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{ach.name}</p>
                    {ach.isUnlocked && <Badge variant="green" size="sm">✓ Unlocked</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{ach.description}</p>
                  {ach.unlockedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ach.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-600">+{ach.points}</p>
                  <p className="text-xs text-gray-400">pts</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
