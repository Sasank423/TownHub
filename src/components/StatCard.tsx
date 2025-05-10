
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
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400',
    gray: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  };

  const trendClasses = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const iconClass = colorClasses[color];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold dark:text-white">{value}</p>
          
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
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
