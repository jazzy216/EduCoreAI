import React, { useState, useEffect } from 'react';
import { AssessmentConfig, AssessmentMode, AssessmentState, Question } from '../types';
import QuestionCard from './QuestionCard';
import ResultsView from './ResultsView';
import { ArrowRight, CheckSquare, Clock } from 'lucide-react';

interface AssessmentRunnerProps {
  questions: Question[];
  config: AssessmentConfig;
  onRestart: () => void;
}

const AssessmentRunner: React.FC<AssessmentRunnerProps> = ({ questions, config, onRestart }) => {
  const [state, setState] = useState<AssessmentState>({
    questions,
    currentQuestionIndex: 0,
    userAnswers: {},
    score: 0,
    isComplete: false,
    history: []
  });

  // UI States
  const [showExplanation, setShowExplanation] = useState(false);
  const [batchSubmitted, setBatchSubmitted] = useState(false); // For Practice mode

  // Helper to get current slice of questions for Practice mode
  const getBatch = () => {
    const batchSize = 5;
    const start = Math.floor(state.currentQuestionIndex / batchSize) * batchSize;
    return state.questions.slice(start, start + batchSize);
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (state.isComplete) return;
    
    // In Learn mode, once revealed, cannot change.
    if (config.mode === AssessmentMode.LEARN && state.userAnswers[questionId]) return;

    setState(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [questionId]: optionId }
    }));
  };

  const calculateScore = (answers: Record<string, string>) => {
    let score = 0;
    state.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) score++;
    });
    return score;
  };

  // --- Actions ---

  const handleLearnCheck = () => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!state.userAnswers[currentQ.id]) return; // Must select something

    setShowExplanation(true); // Reveal
    
    // In Learn mode, we don't advance automatically. User reads then clicks Next.
  };

  const handleNextQuestion = () => {
    // Check if end
    if (state.currentQuestionIndex >= state.questions.length - 1) {
       finishAssessment();
       return;
    }

    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
    setShowExplanation(false);
  };

  const handlePracticeSubmitBatch = () => {
    setBatchSubmitted(true);
    setShowExplanation(true); // Show explanations for all in batch
  };

  const handleNextBatch = () => {
    const batchSize = 5;
    const nextIndex = (Math.floor(state.currentQuestionIndex / batchSize) + 1) * batchSize;
    
    if (nextIndex >= state.questions.length) {
      finishAssessment();
    } else {
      setState(prev => ({ ...prev, currentQuestionIndex: nextIndex }));
      setBatchSubmitted(false);
      setShowExplanation(false);
    }
  };

  const finishAssessment = () => {
    const finalScore = calculateScore(state.userAnswers);
    setState(prev => ({
      ...prev,
      score: finalScore,
      isComplete: true
    }));
  };

  const handleExamSubmit = () => {
    // Ensure all answered? Or just submit.
    finishAssessment();
  };


  // --- Render Logic ---

  if (state.isComplete) {
    return <ResultsView state={state} onReset={onRestart} />;
  }

  // 1. LEARN MODE RENDER
  if (config.mode === AssessmentMode.LEARN) {
    const q = state.questions[state.currentQuestionIndex];
    const isAnswered = !!state.userAnswers[q.id];
    
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4 flex justify-between items-center text-slate-400 text-sm">
           <span>Question {state.currentQuestionIndex + 1} of {state.questions.length}</span>
           <span>Mode: LEARN</span>
        </div>
        <QuestionCard 
          question={q}
          selectedOptionId={state.userAnswers[q.id]}
          onSelectOption={(oid) => handleOptionSelect(q.id, oid)}
          isRevealed={showExplanation}
          mode={AssessmentMode.LEARN}
          showExplanation={showExplanation}
          onToggleExplanation={() => setShowExplanation(!showExplanation)}
        />
        <div className="flex justify-end mt-4">
          {!showExplanation ? (
            <button 
              onClick={handleLearnCheck}
              disabled={!isAnswered}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${isAnswered ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              Check Answer
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="px-6 py-3 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg flex items-center gap-2"
            >
              Next Question <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. PRACTICE MODE RENDER
  if (config.mode === AssessmentMode.PRACTICE) {
    const batch = getBatch();
    const batchSize = 5;
    const currentBatchNum = Math.floor(state.currentQuestionIndex / batchSize) + 1;
    const totalBatches = Math.ceil(state.questions.length / batchSize);
    
    // All answered in this batch?
    const allAnswered = batch.every(q => !!state.userAnswers[q.id]);

    return (
      <div className="max-w-3xl mx-auto p-4 pb-20">
         <div className="mb-6 flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
           <span className="text-slate-300 font-medium">Batch {currentBatchNum} of {totalBatches}</span>
           <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">Practice Mode</span>
        </div>
        
        <div className="space-y-8">
          {batch.map(q => (
            <QuestionCard 
              key={q.id}
              question={q}
              selectedOptionId={state.userAnswers[q.id]}
              onSelectOption={(oid) => handleOptionSelect(q.id, oid)}
              isRevealed={batchSubmitted}
              mode={AssessmentMode.PRACTICE}
              showExplanation={showExplanation} // Controlled by batch submission
              onToggleExplanation={() => {}} // No toggle in practice, shows all on submit
            />
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-700 p-4">
          <div className="max-w-3xl mx-auto flex justify-end">
            {!batchSubmitted ? (
               <button 
                 onClick={handlePracticeSubmitBatch}
                 disabled={!allAnswered}
                 className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 ${allAnswered ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
               >
                 <CheckSquare className="w-5 h-5" /> Submit Batch
               </button>
            ) : (
              <button 
                 onClick={handleNextBatch}
                 className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center gap-2"
               >
                 {currentBatchNum === totalBatches ? 'Finish Review' : 'Next Batch'} <ArrowRight className="w-5 h-5" />
               </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. EXAM MODE RENDER
  if (config.mode === AssessmentMode.EXAM) {
    const answeredCount = Object.keys(state.userAnswers).length;
    const progress = (answeredCount / state.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
         {/* Sticky Header */}
         <div className="sticky top-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl mb-8 flex justify-between items-center">
            <div className="flex items-center gap-4 w-full">
              <div className="bg-rose-500/20 p-2 rounded-lg text-rose-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{answeredCount} / {state.questions.length}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
         </div>

         <div className="space-y-12">
            {state.questions.map((q, idx) => (
              <div key={q.id} className="relative">
                <div className="absolute -left-12 top-0 text-slate-500 font-bold text-xl hidden md:block">
                  {idx + 1}.
                </div>
                <QuestionCard 
                  question={q}
                  selectedOptionId={state.userAnswers[q.id]}
                  onSelectOption={(oid) => handleOptionSelect(q.id, oid)}
                  isRevealed={false} // Never reveal in exam until end
                  mode={AssessmentMode.EXAM}
                  showExplanation={false}
                  onToggleExplanation={() => {}}
                />
              </div>
            ))}
         </div>

         <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-700 p-6 z-30">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <span className="text-slate-400 text-sm">Confirm all answers before submitting.</span>
              <button 
                onClick={handleExamSubmit}
                className="px-8 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40"
              >
                Submit Exam
              </button>
            </div>
         </div>
      </div>
    );
  }

  return <div>Unknown Mode</div>;
};

export default AssessmentRunner;