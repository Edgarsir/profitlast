import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface SimpleChartProps {
  data: ChartData[];
  height?: number;
  color?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({ 
  data, 
  height = 200, 
  color = '#3b82f6' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full space-x-2 pb-4">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 80; // 80% of container height
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-1">
                  {typeof item.value === 'number' && item.value > 1000 
                    ? `${(item.value / 1000).toFixed(1)}k` 
                    : item.value
                  }
                </div>
                <div 
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ 
                    height: `${barHeight}%`, 
                    minHeight: '4px',
                    backgroundColor: color
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2">{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};