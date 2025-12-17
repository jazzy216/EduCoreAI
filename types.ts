export enum AssessmentMode {
  LEARN = 'LEARN',
  PRACTICE = 'PRACTICE',
  EXAM = 'EXAM'
}

export enum InputSource {
  GENERATIVE = 'GENERATIVE',
  CONTEXT = 'CONTEXT'
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  hint: string;
  topicTag: string;
}

export interface AssessmentConfig {
  mode: AssessmentMode;
  source: InputSource;
  // Generative inputs
  category?: string;
  subject?: string;
  tags?: string[];
  // Context inputs
  contextText?: string;
}

export interface AssessmentState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>; // questionId -> optionId
  score: number;
  isComplete: boolean;
  history: {
    questionId: string;
    isCorrect: boolean;
  }[];
}

export type GenerationStatus = 'IDLE' | 'GENERATING' | 'ERROR' | 'SUCCESS';