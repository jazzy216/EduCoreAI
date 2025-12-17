import React from 'react';
import { Question, QuestionOption, AssessmentMode } from '../types';
import { CheckCircle, XCircle, HelpCircle, Lightbulb } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  isRevealed: boolean; // Has the user checked answer (Learn) or submitted batch (Practice)?
  mode: AssessmentMode;
  showExplanation: boolean;
  onToggleExplanation: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptionId,
  onSelectOption,
  isRevealed,
  mode,
  showExplanation,
  onToggleExplanation
}) => {
  const isSelected = (optId: string) => selectedOptionId === optId;
  const isCorrect = (optId: string) => question.correctOptionId === optId;

  const getOptionStyle = (opt: QuestionOption) => {
    // Exam mode or unrevealed state: just show selection
    if (!isRevealed || mode === AssessmentMode.EXAM) {
      if (isSelected(opt.id)) return "bg-blue-600/30 border-blue-500 text-blue-100";
      return "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600";
    }

    // Revealed state (Learn/Practice)
    if (isCorrect(opt.id)) {
      return "bg-green-500/20 border-green-500 text-green-200";
    }
    if (isSelected(opt.id) && !isCorrect(opt.id)) {
      return "bg-red-500/20 border-red-500 text-red-200";
    }
    return "bg-slate-800/50 border-slate-700 text-slate-500 opacity-60";
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-xl animate-fade-in mb-6">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold tracking-wider text-teal-400 bg-teal-950/50 px-2 py-1 rounded uppercase">
          {question.topicTag}
        </span>
      </div>

      <h3 className="text-xl font-medium text-white mb-6 leading-relaxed">
        {question.text}
      </h3>

      <div className="space-y-3">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !isRevealed && onSelectOption(opt.id)} // Lock selection if revealed
            disabled={isRevealed && mode !== AssessmentMode.EXAM}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${getOptionStyle(opt)}`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                isSelected(opt.id) ? 'border-current' : 'border-slate-600 text-slate-500'
              }`}>
                {opt.id}
              </span>
              {opt.text}
            </span>
            
            {/* Icons for feedback */}
            {isRevealed && mode !== AssessmentMode.EXAM && (
              <>
                {isCorrect(opt.id) && <CheckCircle className="w-5 h-5 text-green-400" />}
                {isSelected(opt.id) && !isCorrect(opt.id) && <XCircle className="w-5 h-5 text-red-400" />}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Learn Mode: Immediate Hint/Feedback Control */}
      {mode === AssessmentMode.LEARN && (
        <div className="mt-6 flex gap-3">
           {isRevealed && (
             <button 
                onClick={onToggleExplanation}
                className="text-sm flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
             >
                <Lightbulb className="w-4 h-4" /> 
                {showExplanation ? "Hide Explanation" : "Why is this correct?"}
             </button>
           )}
           {!isRevealed && (
             <div className="flex-1 flex justify-end">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                   <HelpCircle className="w-3 h-3" /> Select an option to check
                </span>
             </div>
           )}
        </div>
      )}

      {/* Feedback Section (Learn & Practice only) */}
      {showExplanation && mode !== AssessmentMode.EXAM && (
        <div className="mt-6 p-4 rounded-xl bg-indigo-900/30 border border-indigo-500/30 text-indigo-200 text-sm leading-relaxed animate-slide-up">
            <h4 className="font-bold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" /> Explanation
            </h4>
            {question.explanation}
            <div className="mt-2 pt-2 border-t border-indigo-500/20 text-xs text-indigo-300">
                <strong>Hint:</strong> {question.hint}
            </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;