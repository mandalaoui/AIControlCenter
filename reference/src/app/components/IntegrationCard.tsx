import { Check, X, Clock, Shield } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  description: string;
  connected: boolean;
  lastSync: string;
  dataType: string;
  icon: string;
}

export function IntegrationCard({ name, description, connected, lastSync, dataType, icon }: IntegrationCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-500">{description}</p>
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
            <X className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Not connected</span>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-xs">
          <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-slate-500 dark:text-slate-500">Last sync: </span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{lastSync}</span>
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <Shield className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-slate-500 dark:text-slate-500">Data: </span>
            <span className="text-slate-700 dark:text-slate-300">{dataType}</span>
          </div>
        </div>
      </div>

      <button
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          connected
            ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {connected ? 'Configure' : 'Connect'}
      </button>
    </div>
  );
}
