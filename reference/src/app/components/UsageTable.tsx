import { AlertTriangle, TrendingUp } from 'lucide-react';
import { usageLogs } from '../data/mockData';
import { useApp } from '../contexts/AppContext';

export function UsageTable() {
  const { isRTL } = useApp();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Team</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Tool</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Model</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">ROI</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Impact</th>
            </tr>
          </thead>
          <tbody>
            {usageLogs.map((log, idx) => (
              <tr key={idx} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-50/30 dark:bg-slate-900/20' : ''}`}>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{log.date}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                    {log.team}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">{log.user}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.tool}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.model}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.type}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-slate-100">${log.cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {log.roi > 500 ? '500%+' : `${log.roi}%`}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                    {log.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {log.risk ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 border border-rose-600 dark:border-rose-500 text-rose-700 dark:text-rose-400 rounded text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {log.risk}
                    </span>
                  ) : (
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      log.productivity === 'High-impact'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {log.productivity}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
