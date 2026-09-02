import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (
    (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_GEMINI_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY)) ||
    ''
  )?.trim();

  if (!apiKey || apiKey === 'MY_GEMINI_KEY' || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your-gemini-key') {
    return null;
  }

  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
      });
    } catch {
      aiClient = null;
    }
  }
  return aiClient;
}

export interface ParsedResumeResult {
  fullName: string;
  title: string;
  skills: string[];
  summary: string;
  workStyle: string;
  location: string;
  minSalary: string;
  experienceYears: number;
  education: string;
  keyAchievements: string[];
}

export interface EmbeddingOptions {
  task?: 'search_query' | 'document' | 'similarity';
  title?: string;
  outputDimensionality?: number;
}

/**
 * Formats prompt for gemini-embedding-2 according to official Gemini documentation:
 * - Search query (Asymmetric): "task: search result | query: {content}"
 * - Document to retrieve (Asymmetric): "title: {title} | text: {content}"
 * - Sentence similarity (Symmetric): "task: sentence similarity | query: {content}"
 */
export function formatEmbeddingPrompt(content: string, options?: EmbeddingOptions): string {
  const task = options?.task || 'similarity';
  const trimmed = content.trim();

  if (task === 'search_query') {
    return `task: search result | query: ${trimmed}`;
  }
  if (task === 'document') {
    const title = options?.title ? options.title.trim() : 'none';
    return `title: ${title} | text: ${trimmed}`;
  }
  return `task: sentence similarity | query: ${trimmed}`;
}

/**
 * Generate 768-dimensional vector embedding using gemini-embedding-2 (with strict error throwing, no fallback).
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = { outputDimensionality: 768 }
): Promise<number[]> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error(
      'Gemini API key is not configured. Please set VITE_GEMINI_KEY in your environment or Settings.'
    );
  }

  const prompt = formatEmbeddingPrompt(text, options);
  const candidateModels = ['gemini-embedding-2', 'gemini-embedding-2-preview'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const result = await ai.models.embedContent({
        model,
        contents: prompt,
        config: {
          outputDimensionality: options.outputDimensionality || 768,
        },
      });

      if (result.embeddings && result.embeddings.length > 0 && result.embeddings[0].values) {
        let values = result.embeddings[0].values;
        if (options.outputDimensionality && values.length > options.outputDimensionality) {
          values = values.slice(0, options.outputDimensionality);
        }
        return values;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Embedding] Attempt with model '${model}' failed:`, err);
    }
  }

  throw new Error(
    `Failed to generate embedding with Gemini (${candidateModels.join(', ')}): ${lastError?.message || lastError || 'No embedding returned'}`
  );
}

/**
 * Generate asymmetric retrieval query embedding for candidate search
 */
export async function generateCandidateQueryEmbedding(profile: {
  title?: string;
  skills?: string[];
  rawText?: string;
  summary?: string;
}): Promise<number[]> {
  const queryText = `Candidate Title: ${profile.title || 'Software Engineer'}\nSkills: ${(profile.skills || []).join(', ')}\nExperience Summary: ${profile.summary || profile.rawText?.slice(0, 2000) || ''}`;
  return generateEmbedding(queryText, {
    task: 'search_query',
    outputDimensionality: 768,
  });
}

/**
 * Generate asymmetric retrieval document embedding for a job posting
 */
export async function generateJobDocumentEmbedding(job: {
  title: string;
  company: string;
  category?: string;
  location?: string;
  required_skills?: string[];
  description: string;
}): Promise<number[]> {
  const docText = `Company: ${job.company}\nCategory: ${job.category || 'Engineering'}\nLocation: ${job.location || 'Remote'}\nRequired Skills: ${(job.required_skills || []).join(', ')}\nDescription: ${job.description}`;
  return generateEmbedding(docText, {
    task: 'document',
    title: `${job.title} at ${job.company}`,
    outputDimensionality: 768,
  });
}

export interface ResumeInputDocument {
  text?: string;
  images?: { mimeType: string; data: string }[];
  pdfBase64?: { mimeType: string; data: string };
  fileName?: string;
}

/**
 * Parse resume document/text into structured fields using gemini-3.5-flash with multimodal image/PDF support.
 * Strictly throws errors if Gemini fails.
 */
export async function parseResumeWithAI(
  input: string | ResumeInputDocument
): Promise<ParsedResumeResult> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error(
      'Gemini API key is not configured. Please set VITE_GEMINI_KEY in your environment or Settings to parse resumes.'
    );
  }

  // Construct multimodal contents payload
  const contentsParts: any[] = [];

  let textContext = '';
  if (typeof input === 'string') {
    textContext = input;
  } else {
    textContext = input.text || '';

    // Attach rendered high-res page images if available (multimodal vision)
    if (input.images && input.images.length > 0) {
      for (const img of input.images) {
        contentsParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          },
        });
      }
    } else if (input.pdfBase64) {
      // Or attach direct PDF document
      contentsParts.push({
        inlineData: {
          mimeType: input.pdfBase64.mimeType,
          data: input.pdfBase64.data,
        },
      });
    }
  }

  let promptInstruction = 'You are an expert talent scout and resume parser. Carefully examine this resume document and extract candidate metadata, technical skills, title, summary, work style preference strictly in JSON matching the schema.';
  if (textContext.trim().length > 0) {
    promptInstruction += `\n\nResume Document Content:\n${textContext.slice(0, 10000)}`;
  }
  contentsParts.push(promptInstruction);

  const candidateModels = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: contentsParts,
        config: {
          systemInstruction:
            'Extract accurate candidate metadata, technical skills, title, summary, work style preference strictly in JSON format matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              title: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              summary: { type: Type.STRING },
              workStyle: { type: Type.STRING },
              location: { type: Type.STRING },
              minSalary: { type: Type.STRING },
              experienceYears: { type: Type.NUMBER },
              education: { type: Type.STRING },
              keyAchievements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['fullName', 'title', 'skills', 'summary'],
          },
        },
      });

      const rawJson = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawJson);

      if (!parsed.fullName && (!parsed.skills || parsed.skills.length === 0)) {
        throw new Error('Parsed response did not contain required candidate name or skills.');
      }

      return {
        fullName: parsed.fullName || 'Candidate',
        title: parsed.title || 'Software Engineer',
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        summary: parsed.summary || '',
        workStyle: parsed.workStyle || 'Remote',
        location: parsed.location || 'Remote / US',
        minSalary: parsed.minSalary || '$140,000 / yr',
        experienceYears: Number(parsed.experienceYears) || 3,
        education: parsed.education || '',
        keyAchievements: Array.isArray(parsed.keyAchievements) ? parsed.keyAchievements : [],
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Resume Parser] Model '${model}' attempt failed:`, err);
    }
  }

  throw new Error(
    `Gemini resume parsing failed (${candidateModels.join(', ')}): ${lastError?.message || lastError || 'Unknown parsing failure'}`
  );
}

