import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server."
      );
    }
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

export const MODEL_NAME = "gemini-3-flash-preview";

export async function generateStructuredJSON<T>(
  prompt: string,
  systemPrompt: string,
  schemaDescription: string
): Promise<T> {
  try {
    const genAI = getGenAI();

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 16000,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(
      prompt + "\n\nOutput schema description:\n" + schemaDescription
    );

    const response = result.response;
    const text = response.text();

    return safeParseJSON<T>(text);
  } catch (geminiError) {
    const errorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
    
    // Check if Gemini is busy, rate-limited, overloaded, or experiencing token issues
    const isGeminiBusyOrRateLimited =
      errorMsg.includes("503") ||
      errorMsg.includes("Service Unavailable") ||
      errorMsg.includes("429") ||
      errorMsg.includes("ResourceExhausted") ||
      errorMsg.includes("limit") ||
      errorMsg.includes("quota") ||
      errorMsg.includes("demand") ||
      errorMsg.includes("busy") ||
      errorMsg.includes("token");

    const groqApiKey = process.env.GROQ_API_KEY;

    if (isGeminiBusyOrRateLimited && groqApiKey) {
      console.warn(
        `Gemini failed or is busy (Error: ${errorMsg}). Attempting fallback to Groq API...`
      );

      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation, just raw JSON." },
              {
                role: "user",
                content: prompt + "\n\nOutput schema description (respond with JSON matching this schema):\n" + schemaDescription,
              },
            ],
            temperature: 0.3,
            response_format: {
              type: "json_object",
            },
          }),
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(
            `Groq API returned status ${response.status}: ${response.statusText}. Details: ${errorDetails}`
          );
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        if (!responseText) {
          throw new Error("Groq response JSON choices list or content was empty.");
        }

        console.log("Successfully completed analysis request using Groq API fallback.");
        return safeParseJSON<T>(responseText);
      } catch (groqError) {
        console.error("Groq fallback also failed:", groqError);
        throw new Error(
          `AI Generation failed. Primary Gemini Error: ${errorMsg}. Fallback Groq Error: ${
            groqError instanceof Error ? groqError.message : String(groqError)
          }`
        );
      }
    }

    throw geminiError;
  }
}

function safeParseJSON<T>(text: string): T {
  // Attempt 1: direct parse
  try {
    return JSON.parse(text) as T;
  } catch {
    // continue to fallbacks
  }

  // Attempt 2: extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    } catch {
      // continue
    }
  }

  // Attempt 3: find outermost { } or [ ]
  const jsonStart = text.search(/[\[{]/);
  const jsonEnd = text.search(/[\]}][^\]}]*$/);
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    try {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as T;
    } catch {
      // continue
    }
  }

  throw new Error(
    "Failed to parse AI response as JSON. The AI may have returned malformed data. Please try again."
  );
}
