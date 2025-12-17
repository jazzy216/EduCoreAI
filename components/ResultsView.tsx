import React from 'react';
import { AssessmentState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RefreshCcw, CheckCircle, XCircle } from 'lucide-react';

interface ResultsViewProps {
  state: AssessmentState;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ state, onReset }) => {
  const total = state.questions.length;
  const correct = state.score;
  const incorrect = total - correct;
  const percentage = Math.round((correct / total) * 100);

  const data = [
    { name: 'Correct', value: correct, color: '#10b981' }, // Emerald 500
    { name: 'Incorrect', value: incorrect, color: '#ef4444' }, // Red 500
  ];

  const getFeedbackMessage = () => {
    if (percentage >= 90) return "Outstanding! You've mastered this module.";
    if (percentage >= 70) return "Great job! You have a solid understanding.";
    if (percentage >= 50) return "Good effort. Review the weak areas.";
    return "Keep studying. Focus on the core concepts.";
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">Assessment Complete</h2>
        <p className="text-xl text-slate-400">{getFeedbackMessage()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Chart */}
        <div className="h-80 bg-slate-800/50 rounded-2xl border border-slate-700 p-4 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats & Breakdown */}
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 text-center">
                    <div className="text-3xl font-bold text-white">{percentage}%</div>
                    <div className="text-sm text-slate-400">Total Score</div>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 text-center">
                    <div className="text-3xl font-bold text-white">{total}</div>
                    <div className="text-sm text-slate-400">Questions</div>
                </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Performance Summary</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="flex items-center gap-2 text-green-400"><CheckCircle size={18} /> Correct Answers</span>
                        <span className="font-mono text-white">{correct}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="flex items-center gap-2 text-red-400"><XCircle size={18} /> Needs Improvement</span>
                        <span className="font-mono text-white">{incorrect}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/50 flex items-center gap-2 transition-all hover:scale-105"
        >
          <RefreshCcw className="w-5 h-5" /> Start New Session
        </button>
      </div>
    </div>
  );
};

export default ResultsView;