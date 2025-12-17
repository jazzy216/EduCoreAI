import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssessmentConfig, AssessmentMode, InputSource, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const QUESTION_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      text: { type: Type.STRING, description: "The question text itself." },
      options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "A unique ID for the option (e.g., 'A', 'B')." },
            text: { type: Type.STRING }
          },
          required: ["id", "text"]
        }
      },
      correctOptionId: { type: Type.STRING, description: "The ID of the correct option." },
      explanation: { type: Type.STRING, description: "Detailed explanation of why the answer is correct." },
      hint: { type: Type.STRING, description: "A subtle hint to help the user answer." },
      topicTag: { type: Type.STRING, description: "The specific sub-topic this question relates to." }
    },
    required: ["id", "text", "options", "correctOptionId", "explanation", "hint", "topicTag"]
  }
};

export const generateAssessment = async (config: AssessmentConfig): Promise<Question[]> => {
  const modelName = 'gemini-2.5-flash';

  let promptContext = "";
  let count = 5; // Default base count
  let toneInstruction = "";

  // Configure based on Mode
  switch (config.mode) {
    case AssessmentMode.LEARN:
      count = 5; // Learn mode generates smaller chunks usually, but we'll do 5 initial
      toneInstruction = "Tone: Encouraging, tutor-like. Questions should be foundational to help concept acquisition.";
      break;
    case AssessmentMode.PRACTICE:
      count = 10;
      toneInstruction = "Tone: Objective, coaching-oriented. Questions should apply skills with medium difficulty.";
      break;
    case AssessmentMode.EXAM:
      count = 15;
      toneInstruction = "Tone: Formal, strict. Questions should be challenging, simulating a real exam environment.";
      break;
  }

  // Configure based on Source
  if (config.source === InputSource.GENERATIVE) {
    promptContext = `
      Create a set of ${count} multiple-choice questions based on the following criteria:
      Category: ${config.category}
      Subject/Certificate: ${config.subject}
      Focus Tags: ${config.tags?.join(", ")}
    `;
  } else {
    promptContext = `
      Analyze the provided context text below and generate ${count} multiple-choice questions strictly based on this material.
      
      --- CONTEXT START ---
      ${config.contextText?.substring(0, 30000)} 
      --- CONTEXT END ---
    `;
  }

  const systemInstruction = `
    You are EduCore, an expert educational AI.
    ${toneInstruction}
    Generate valid JSON output strictly following the schema.
    Ensure options are plausible distractors.
    Each question must have exactly 4 options.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptContext,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: QUESTION_SCHEMA,
        temperature: 0.7, // Balance creativity and accuracy
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated");
    }

    const questions = JSON.parse(text) as Question[];
    // Ensure uniqueness of IDs just in case
    return questions.map((q, idx) => ({ ...q, id: `${Date.now()}-${idx}` }));

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate assessment. Please try again.");
  }
};