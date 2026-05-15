import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useApp } from '../contexts/AppContext';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  trend: number[];
  explanation: string;
  suffix?: string;
  prefix?: string;
}

export function KPICard({ title, value, change, trend, explanation, suffix, prefix }: KPICardProps) {
  const { theme } = useApp();
  const isPositive = change > 0;
  const isGoodChange = !title.toLowerCase().includes('underused') && !title.toLowerCase().includes('cost per');
  const changeColor = (isPositive === isGoodChange) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

  const chartData = trend.map((val, idx) => ({ value: val, index: idx }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
        <div className="h-12 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive === isGoodChange ? '#10b981' : '#f43f5e'}
                strokeWidth={2.5}
                dot={false}
                opacity={0.9}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        {prefix && <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{prefix}</span>}
        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</span>
        {suffix && <span className="text-xl text-slate-600 dark:text-slate-400">{suffix}</span>}
      </div>

      <div className="flex items-center gap-2 mb-3">
        {isPositive ? (
          <TrendingUp className={`w-4 h-4 ${changeColor}`} />
        ) : (
          <TrendingDown className={`w-4 h-4 ${changeColor}`} />
        )}
        <span className={`text-sm font-medium ${changeColor}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-500">vs previous period</span>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-100 dark:border-blue-900/50 border-l-2 border-l-blue-600 dark:border-l-blue-500">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{explanation}</p>
      </div>
    </div>
  );
}
