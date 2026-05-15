import { TrendingDown, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  reason: string;
  savings: number;
  impact: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
}

export function RecommendationCard({ title, reason, savings, impact, confidence, risk }: RecommendationCardProps) {
  const riskColors = {
    low: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    medium: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    high: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-tight">{title}</h4>
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            ${savings.toLocaleString()}/mo
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{reason}</p>

      <div className="flex items-center gap-2 mb-3 text-xs text-slate-600 dark:text-slate-400">
        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>{impact}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${riskColors[risk]}`}>
            {risk} risk
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-500">
            {confidence}% confidence
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-medium rounded-md transition-colors">
          Apply
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
