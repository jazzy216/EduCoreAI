import React, { useState } from 'react';
import { AssessmentConfig, AssessmentMode, InputSource } from '../types';
import { BookOpen, Upload, Cpu, GraduationCap, Target, Clock, AlertCircle } from 'lucide-react';

interface SetupFormProps {
  onStart: (config: AssessmentConfig) => void;
  isLoading: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStart, isLoading }) => {
  const [mode, setMode] = useState<AssessmentMode>(AssessmentMode.LEARN);
  const [source, setSource] = useState<InputSource>(InputSource.GENERATIVE);
  
  // Generative State
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');

  // Context State
  const [contextText, setContextText] = useState('');

  const handleStart = () => {
    const config: AssessmentConfig = {
      mode,
      source,
      category: source === InputSource.GENERATIVE ? category : undefined,
      subject: source === InputSource.GENERATIVE ? subject : undefined,
      tags: source === InputSource.GENERATIVE ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      contextText: source === InputSource.CONTEXT ? contextText : undefined,
    };
    onStart(config);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setContextText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const isFormValid = () => {
    if (source === InputSource.GENERATIVE) {
      return category.length > 0 && subject.length > 0;
    } else {
      return contextText.length > 100;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          Configure Your Session
        </h2>
        <p className="text-slate-400 mt-2">Select your learning path and intensity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Source Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" /> Knowledge Source
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSource(InputSource.GENERATIVE)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                source === InputSource.GENERATIVE
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              <Target className="w-6 h-6" />
              <span className="font-medium">Topic Base</span>
            </button>
            <button
              onClick={() => setSource(InputSource.CONTEXT)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                source === InputSource.CONTEXT
                  ? 'bg-teal-600/20 border-teal-500 text-teal-300'
                  : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              <BookOpen className="w-6 h-6" />
              <span className="font-medium">My Content</span>
            </button>
          </div>

          {source === InputSource.GENERATIVE ? (
            <div className="space-y-3 animate-fade-in">
              <input
                type="text"
                placeholder="Category (e.g., Computer Science)"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                type="text"
                placeholder="Subject (e.g., React Hooks)"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <textarea
                placeholder="Paste your study notes or content here (min 100 chars)..."
                className="w-full h-32 bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
              />
              <div className="relative">
                <input 
                    type="file" 
                    id="file-upload"
                    accept=".txt,.md,.json"
                    className="hidden" 
                    onChange={handleFileUpload}
                />
                <label 
                    htmlFor="file-upload" 
                    className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer text-sm text-slate-300 transition-colors"
                >
                    <Upload className="w-4 h-4" /> Upload Text File (.txt, .md)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" /> Mode Selection
          </h3>
          <div className="space-y-3">
            {[
              {
                id: AssessmentMode.LEARN,
                title: "Learn Mode",
                desc: "Immediate feedback, hints, low stress.",
                icon: BookOpen,
                color: "purple"
              },
              {
                id: AssessmentMode.PRACTICE,
                title: "Practice Mode",
                desc: "Batches of 5, feedback after submission.",
                icon: Target,
                color: "amber"
              },
              {
                id: AssessmentMode.EXAM,
                title: "Exam Mode",
                desc: "Full length, strict, results at end.",
                icon: Clock,
                color: "rose"
              }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${
                  mode === m.id
                    ? `bg-${m.color}-500/10 border-${m.color}-500 ring-1 ring-${m.color}-500`
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg bg-${m.color}-500/20 text-${m.color}-400`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-semibold ${mode === m.id ? 'text-white' : 'text-slate-300'}`}>{m.title}</h4>
                  <p className="text-xs text-slate-400">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-700 flex justify-end">
        <button
          onClick={handleStart}
          disabled={!isFormValid() || isLoading}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all ${
            !isFormValid() || isLoading
              ? 'bg-slate-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:shadow-blue-500/25 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>Generating Module...</>
          ) : (
            <>Initialize EduCore <Cpu className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupForm;