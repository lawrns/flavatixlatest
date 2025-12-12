import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FlavorWheelData } from '../types';

interface SimpleWheelProps {
  data: FlavorWheelData['data'];
  size?: number;
}

export const SimpleWheel: React.FC<SimpleWheelProps> = ({ data, size = 100 }) => {
  // Map simplified data for recharts
  const chartData = data.map(d => ({ name: d.label, value: d.value, color: d.color }));

  return (
    <div style={{ width: size, height: size }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.25}
            outerRadius={size * 0.45}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-white/50" />
      </div>
    </div>
  );
};
