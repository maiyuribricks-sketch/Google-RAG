import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UploadedFile } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRAGResponse = async (
  query: string,
  files: UploadedFile[],
  history: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  const ai = createClient();
  
  // 1. Construct the context from files
  // We use Gemini's large context window (1M+ tokens) to "stuff" the documents.
  // For a massive production system, you'd want vector retrieval here,
  // but for a "Custom RAG" demo with < 50 files, this is superior due to full context visibility.
  const contextBlock = files.map(f => `
<DOCUMENT>
  <TITLE>${f.name}</TITLE>
  <CONTENT>
${f.content}
  </CONTENT>
</DOCUMENT>
`).join('\n');

  const systemInstruction = `
You are a highly intelligent Knowledge Base Assistant.
Your goal is to answer the user's questions strictly based on the provided <DOCUMENT> blocks.

RULES:
1. Use ONLY the information in the provided documents to answer.
2. If the answer is not in the documents, say "I cannot find information regarding this in the uploaded files."
3. Cite the document title when you reference specific facts (e.g., [Schedule.txt]).
4. Be concise and professional.
5. You can use markdown for formatting tables, lists, and code.

CONTEXT LIBRARY:
${contextBlock}
`;

  // Convert history to compatible format if needed, but for single-turn RAG with context
  // it is often better to provide context in system instruction + chat history.
  // The SDK chat helper is good, but we might want stateless generation for RAG to ensure context is fresh.
  // However, let's use the Chat API to allow follow-up questions about the *same* docs.

  // We will re-initialize the chat for the demo to ensure the system instruction (which contains the docs) is fresh.
  // In a real app with huge docs, we might cache the context or use caching API.
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview', // High intelligence for RAG reasoning
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 2048 }, // Enable thinking for better retrieval/reasoning
        temperature: 0.2, // Lower temperature for more factual responses
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const response: GenerateContentResponse = await chat.sendMessage({
      message: query
    });

    return response.text || "No response generated.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while analyzing the documents. Please try again.";
  }
};
