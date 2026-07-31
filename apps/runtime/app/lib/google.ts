import { createGoogleGenerativeAI, google as defaultGoogle } from "@ai-sdk/google";

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GEMINI_API_KEY;

export const google = apiKey
  ? createGoogleGenerativeAI({ apiKey })
  : defaultGoogle;

export const CRADLE_MODEL_ID = process.env.CRADLE_MODEL_ID || "gemini-flash-lite-latest";
