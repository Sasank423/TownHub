
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-500',
    green: 'bg-green-50 text-green-500',
    amber: 'bg-amber-50 text-amber-500',
    red: 'bg-red-50 text-red-500',
    purple: 'bg-purple-50 text-purple-500',
    gray: 'bg-gray-50 text-gray-500',
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const iconClass = colorClasses[color];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          
          {trend && trendValue && (
            <p className={`mt-2 text-sm flex items-center ${trendClasses[trend]}`}>
              {trend === 'up' && <span className="mr-1">↑</span>}
              {trend === 'down' && <span className="mr-1">↓</span>}
              {trendValue}
            </p>
          )}
        </div>
        
        <div className={`p-3.5 rounded-full ${iconClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
