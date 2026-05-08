'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  calories: number;
  protein?: number;
  water?: number;
}

interface NutritionChartProps {
  data: DataPoint[];
  metric: 'calories' | 'protein' | 'water';
  goal?: number;
  color?: string;
}

const COLORS = {
  calories: '#22c55e',
  protein: '#3b82f6',
  water: '#06b6d4',
};

export function NutritionChart({ data, metric, goal, color }: NutritionChartProps) {
  const c = color ?? COLORS[metric];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={c} stopOpacity={0.3} />
            <stop offset="95%" stopColor={c} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          domain={[0, 'auto']}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            fontSize: '12px',
          }}
        />
        {goal && (
          <ReferenceLine
            y={goal}
            stroke={c}
            strokeDasharray="4 4"
            opacity={0.6}
            label={{ value: 'Goal', position: 'insideTopRight', fontSize: 10, fill: c }}
          />
        )}
        <Area
          type="monotone"
          dataKey={metric}
          stroke={c}
          strokeWidth={2.5}
          fill={`url(#grad-${metric})`}
          dot={false}
          activeDot={{ r: 5, fill: c }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
