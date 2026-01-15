import { LucideIcon } from 'lucide-react';

interface TenantStatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  trend: string;
}

export default function TenantStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: TenantStatsCardProps) {
  const isPositiveTrend = trend.startsWith('+');
  const isNegativeTrend = trend.startsWith('-');

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span
          className={`text-sm font-medium ${
            isPositiveTrend
              ? 'text-green-600'
              : isNegativeTrend
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          {trend}
        </span>
        <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
      </div>
    </div>
  );
}
