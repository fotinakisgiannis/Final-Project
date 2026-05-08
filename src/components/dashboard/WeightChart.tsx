'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightLog {
  loggedAt: string;
  weightKg: number;
}

export function WeightChart() {
  const [data, setData] = useState<{ date: string; weight: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weight?limit=30')
      .then((r) => r.json())
      .then((d) => {
        const chartData = (d.logs as WeightLog[]).map((l) => ({
          date: format(new Date(l.loggedAt), 'MMM d'),
          weight: Math.round(l.weightKg * 10) / 10,
        }));
        setData(chartData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (data.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
        Log your weight to see trends
      </div>
    );
  }

  const first = data[0].weight;
  const last = data[data.length - 1].weight;
  const change = Math.round((last - first) * 10) / 10;
  const TrendIcon = change < 0 ? TrendingDown : change > 0 ? TrendingUp : Minus;
  const trendColor = change < 0 ? 'text-brand-500' : change > 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">{last} kg</span>
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {change > 0 ? '+' : ''}{change} kg
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            labelStyle={{ color: '#374151' }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#22c55e' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
