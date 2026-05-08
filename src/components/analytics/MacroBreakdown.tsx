'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MacroBreakdownProps {
  protein: number;
  carbs: number;
  fat: number;
}

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

export function MacroBreakdown({ protein, carbs, fat }: MacroBreakdownProps) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  if (total === 0) return <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>;

  const data = [
    { name: 'Protein', value: Math.round((protein * 4 / total) * 100), grams: protein },
    { name: 'Carbs', value: Math.round((carbs * 4 / total) * 100), grams: carbs },
    { name: 'Fat', value: Math.round((fat * 9 / total) * 100), grams: fat },
  ];

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            cx={55}
            cy={55}
            innerRadius={35}
            outerRadius={55}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
              <span className="text-xs text-gray-400 ml-1">{Math.round(item.grams)}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
