import { AppProvider, useApp } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { KPICard } from './components/KPICard';
import { QueryAssistant } from './components/QueryAssistant';
import { RecommendationCard } from './components/RecommendationCard';
import { UsageTable } from './components/UsageTable';
import { IntegrationCard } from './components/IntegrationCard';
import { translations } from './data/translations';
import { kpiData, roiByTeam, roiByTool, costByProvider, spendOverTime, recommendations, integrations } from './data/mockData';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Sparkles } from 'lucide-react';

function DashboardContent() {
  const { theme, language, isRTL } = useApp();
  const t = translations[language];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="max-w-[1600px] mx-auto space-y-12">
        {/* Executive Overview */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.executiveOverview}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title={t.totalAISpend}
              value={formatCurrency(kpiData.totalSpend.value)}
              change={kpiData.totalSpend.change}
              trend={kpiData.totalSpend.trend}
              explanation="Spend increased due to new engineering AI initiatives and expanded team usage. ROI remains strong across all tools."
            />
            <KPICard
              title={t.estimatedROI}
              value={formatNumber(kpiData.roi.value)}
              change={kpiData.roi.change}
              trend={kpiData.roi.trend}
              explanation="Strong ROI growth driven by GitHub Copilot and Cursor adoption in engineering, saving 2,847 hours this month."
              suffix="%"
            />
            <KPICard
              title={t.costSavingsOpportunity}
              value={formatCurrency(kpiData.savings.value)}
              change={kpiData.savings.change}
              trend={kpiData.savings.trend}
              explanation="Primary opportunities: unused seats (12), model optimization (38% of tasks could use cheaper models), and workflow efficiency."
            />
            <KPICard
              title={t.hoursSaved}
              value={formatNumber(kpiData.hoursSaved.value)}
              change={kpiData.hoursSaved.change}
              trend={kpiData.hoursSaved.trend}
              explanation="Engineering team leads with 1,840 hours saved through AI-assisted coding, followed by Product (580 hours) from document analysis."
            />
            <KPICard
              title={t.costPerTask}
              value={formatNumber(kpiData.costPerTask.value)}
              change={kpiData.costPerTask.change}
              trend={kpiData.costPerTask.trend}
              explanation="Cost efficiency improving through better model selection and reduced low-value usage. Marketing shows best optimization."
              prefix="$"
            />
            <KPICard
              title={t.aiEfficiencyScore}
              value={formatNumber(kpiData.efficiencyScore.value)}
              change={kpiData.efficiencyScore.change}
              trend={kpiData.efficiencyScore.trend}
              explanation="Efficiency improved by reducing waste and unused seats. Top performers: Engineering (92), Customer Success (91), Product (88)."
            />
            <KPICard
              title={t.activeAIUsers}
              value={formatNumber(kpiData.activeUsers.value)}
              change={kpiData.activeUsers.change}
              trend={kpiData.activeUsers.trend}
              explanation="Growing adoption across teams. Engineering (85 users) and Product (48 users) show highest engagement with AI tools."
            />
            <KPICard
              title={t.underusedSeats}
              value={formatNumber(kpiData.underusedSeats.value)}
              change={kpiData.underusedSeats.change}
              trend={kpiData.underusedSeats.trend}
              explanation="Improvement from proactive license management. Remaining seats: 12 Cursor, 4 GitHub Copilot, 2 Microsoft Copilot."
            />
          </div>
        </section>

        {/* ROI & Efficiency */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[26px] font-bold text-slate-900 dark:text-slate-100">{t.roiAnalysis}</h2>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">AI-Analyzed</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">ROI by Team</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiByTeam}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="team" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                      border: '1px solid',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                    }}
                  />
                  <ReferenceLine y={100} stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} strokeDasharray="3 3" strokeWidth={1.5} />
                  <Bar dataKey="roi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-100 dark:border-blue-900/50 border-l-2 border-l-blue-600 dark:border-l-blue-500">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    Engineering leads with 425% ROI ($204K value from $48K spend). Consider expanding AI tools to Operations team (265% ROI) for greater impact.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">ROI by Tool</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiByTool} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                  <XAxis type="number" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="tool" type="category" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                      border: '1px solid',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                    }}
                  />
                  <Bar dataKey="roi" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-md border border-purple-100 dark:border-purple-900/50 border-l-2 border-l-purple-600 dark:border-l-purple-500">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    GitHub Copilot shows exceptional 520% ROI. Slack AI underperforms at 185% due to low adoption (23% seat utilization).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[26px] font-bold text-slate-900 dark:text-slate-100">{t.costBreakdown}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Spend by Provider</h3>
              <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costByProvider}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costByProvider.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                        border: '1px solid',
                        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      ${costByProvider.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Spend Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                      border: '1px solid',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                    }}
                  />
                  <Legend wrapperStyle={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <Line type="monotone" dataKey="openai" stroke="#10a37f" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="anthropic" stroke="#d4a574" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="github" stroke="#238636" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="other" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Query Assistant */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[26px] font-bold text-slate-900 dark:text-slate-100">{t.askAI}</h2>
          </div>
          <QueryAssistant />
        </section>

        {/* Optimization Center */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[26px] font-bold text-slate-900 dark:text-slate-100">{t.recommendations}</h2>
            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">${recommendations.reduce((sum, r) => sum + r.savings, 0).toLocaleString()}/mo potential</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} {...rec} />
            ))}
          </div>
        </section>

        {/* Usage Logs */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[26px] font-bold text-slate-900 dark:text-slate-100">{t.usageLogs}</h2>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">AI-Categorized</span>
            </div>
          </div>
          <UsageTable />
        </section>

        {/* Integrations */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[26px] font-bold text-slate-900 dark:text-slate-100">{t.integrations}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} {...integration} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AppContainer() {
  const { theme } = useApp();

  return (
    <div className={`flex h-screen bg-slate-100 ${theme === 'dark' ? 'dark' : ''}`}>
      <style>{`
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .dark {
          color-scheme: dark;
        }
      `}</style>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <DashboardContent />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}