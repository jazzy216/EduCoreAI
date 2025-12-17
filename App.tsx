import React, { useState } from 'react';
import SetupForm from './components/SetupForm';
import AssessmentRunner from './components/AssessmentRunner';
import { AssessmentConfig, Question, GenerationStatus } from './types';
import { generateAssessment } from './services/geminiService';
import { BrainCircuit, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<AssessmentConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState<GenerationStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (newConfig: AssessmentConfig) => {
    setConfig(newConfig);
    setStatus('GENERATING');
    setError(null);

    try {
      const generatedQuestions = await generateAssessment(newConfig);
      setQuestions(generatedQuestions);
      setStatus('SUCCESS');
    } catch (err: any) {
      setError(err.message || "Failed to generate assessment");
      setStatus('ERROR');
    }
  };

  const handleRestart = () => {
    setStatus('IDLE');
    setQuestions([]);
    setConfig(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-2 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              EduCore
            </h1>
          </div>
          {status === 'SUCCESS' && (
            <button 
              onClick={handleRestart}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Exit Session
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {status === 'IDLE' && (
          <div className="animate-fade-in-up">
            <SetupForm onStart={handleStart} isLoading={false} />
          </div>
        )}

        {status === 'GENERATING' && (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
            <h2 className="text-2xl font-semibold text-slate-200">Constructing Neural Module...</h2>
            <p className="text-slate-400 mt-2">Analyzing parameters and generating adaptive content.</p>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="max-w-md mx-auto mt-20 p-6 bg-red-900/20 border border-red-500/50 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-red-400 mb-2">Initialization Failed</h3>
            <p className="text-slate-300 mb-6">{error}</p>
            <button 
              onClick={() => setStatus('IDLE')}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'SUCCESS' && config && (
          <AssessmentRunner 
            questions={questions} 
            config={config} 
            onRestart={handleRestart} 
          />
        )}

      </main>

      {/* Subtle background decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen animate-blob"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default App;