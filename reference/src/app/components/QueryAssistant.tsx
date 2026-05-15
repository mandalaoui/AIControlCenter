import { useState } from 'react';
import { Send, Sparkles, TrendingDown, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { suggestedQuestions } from '../data/mockData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
}

export function QueryAssistant() {
  const { language, isRTL } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you understand your AI costs and find optimization opportunities. Try asking me one of the questions below, or ask your own.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (question?: string) => {
    const text = question || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');

    setTimeout(() => {
      let response = '';
      let data = null;

      if (text.toLowerCase().includes('overspent') || text.toLowerCase().includes('team')) {
        response = 'The **Engineering team** overspent by **$4,200 (9.5%)** this month. The main driver was increased usage of Claude Opus for code generation tasks. However, ROI remains strong at 425%, suggesting the spend is justified. Consider migrating some routine tasks to Sonnet to maintain quality while reducing costs.';
        data = { team: 'Engineering', overspend: 4200, roi: 425 };
      } else if (text.toLowerCase().includes('lowest roi')) {
        response = '**Slack AI** has the lowest ROI at **185%**, with only 23% seat utilization. Many licenses are unused. I recommend reducing seats from 80 to 20 active users, saving **$1,850/month** with minimal impact.';
        data = { tool: 'Slack AI', roi: 185, savings: 1850 };
      } else if (text.toLowerCase().includes('reduce costs')) {
        response = 'Top 3 cost reduction opportunities without hurting productivity:\n\n1. **Reduce inactive Cursor seats** → Save $2,400/month (95% confidence)\n2. **Move simple tasks to GPT-4o mini** → Save $8,900/month (88% confidence)\n3. **Replace Claude Opus with Sonnet for code reviews** → Save $5,200/month (82% confidence)\n\nTotal potential savings: **$16,500/month** with low risk.';
        data = { totalSavings: 16500 };
      } else if (text.toLowerCase().includes('increase') || text.toLowerCase().includes('why')) {
        response = 'AI spend increased **12.3%** this week primarily due to:\n\n1. **Engineering team** launched new AI-assisted refactoring project (+$2,800)\n2. **Product team** increased Claude API usage for document analysis (+$1,200)\n3. **Marketing** experimented with content generation (+$900)\n\nThe increase is justified by business initiatives, but I detected optimization opportunities in the engineering workflow.';
      } else if (text.toLowerCase().includes('replace') || text.toLowerCase().includes('model')) {
        response = 'Based on usage patterns, I recommend:\n\n1. Replace **GPT-4** with **GPT-4o mini** for simple classification tasks → 60% cost reduction\n2. Replace **Claude Opus** with **Sonnet** for code reviews → 40% cost reduction, similar quality\n3. Keep **GitHub Copilot** and **Cursor** as-is → both show excellent ROI (490%+)\n\nEstimated monthly savings: **$14,100**';
      } else {
        response = 'I analyzed your request. Your total AI spend is **$142,850/month** with an average ROI of **385%**. You have **$28,500** in potential cost savings through optimization. The highest-impact areas are unused seats and model selection. Would you like me to explain any specific metric?';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response, data }]);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="bg-blue-600 dark:bg-blue-700 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Query Assistant</h3>
          <p className="text-xs text-blue-50">Ask me anything about your AI costs and usage</p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
              {msg.data && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="opacity-75">Data-backed insight</span>
                  </div>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                JD
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about costs, ROI, optimization..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          />
          <button
            onClick={() => handleSend()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
