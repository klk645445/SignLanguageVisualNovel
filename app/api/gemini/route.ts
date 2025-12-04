import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const MAX_RETRIES = 3;

interface GeminiResponse {
  characterResponse: string;
  emotion: string;
  evaluation: string;
  rating: string;
}

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
}

// Helper function to clean and parse JSON response
function parseGeminiResponse(textResponse: string): GeminiResponse {
  let cleanedResponse = textResponse.trim();
  
  // Remove markdown code blocks if present
  if (cleanedResponse.startsWith("```json")) {
    cleanedResponse = cleanedResponse.slice(7);
  } else if (cleanedResponse.startsWith("```")) {
    cleanedResponse = cleanedResponse.slice(3);
  }
  if (cleanedResponse.endsWith("```")) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }
  cleanedResponse = cleanedResponse.trim();

  const parsed = JSON.parse(cleanedResponse);
  
  // Validate required fields
  if (typeof parsed.characterResponse !== "string" || !parsed.characterResponse) {
    throw new Error("Missing or invalid characterResponse");
  }
  if (typeof parsed.emotion !== "string" || !parsed.emotion) {
    throw new Error("Missing or invalid emotion");
  }
  if (typeof parsed.evaluation !== "string" || !parsed.evaluation) {
    throw new Error("Missing or invalid evaluation");
  }
  if (!["good", "neutral", "bad"].includes(parsed.rating)) {
    throw new Error("Invalid rating - must be good, neutral, or bad");
  }
  
  return parsed as GeminiResponse;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const { userInput, context, allowedEmotions } = await request.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      );
    }

    // Build allowed emotions list
    const emotions = allowedEmotions?.length > 0 
      ? allowedEmotions.join('", "') 
      : 'happy", "sad", "angry", "neutral';

    // Build the initial prompt
    const basePrompt = `${context || "You are a hard of hearing character in a visual novel game. Respond to the player's input."}

User's input: "${userInput}"

You MUST respond with a valid JSON object in this exact format (no markdown, no code blocks, just the JSON):
{
  "characterResponse": "What you would say in response to the player",
  "emotion": "one of: \"${emotions}\"",
  "evaluation": "A brief evaluation of how well the player responded from a third person perspective",
  "rating": "good OR neutral OR bad (based on how appropriate/helpful the player's response was)"
}

Rating guidelines:
- "good": The response was thoughtful, kind, helpful, or showed good understanding
- "neutral": The response was acceptable but also irrelevant or unhelpful
- "bad": The response was rude, unhelpful, inappropriate, or showed poor understanding

Respond ONLY with the JSON object, nothing else:`;

    let lastError: Error | null = null;
    let lastRawResponse = "";

    // Retry loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        let prompt = basePrompt;
        
        // If this is a retry, add error context to help the LLM correct itself
        if (attempt > 1 && lastRawResponse) {
          prompt = `Your previous response was invalid JSON. Here was your response:
"${lastRawResponse}"

Error: ${lastError?.message || "Invalid JSON format"}

Please try again. ${basePrompt}`;
        }

        const textResponse = await callGeminiAPI(prompt);
        lastRawResponse = textResponse;
        
        const parsedResponse = parseGeminiResponse(textResponse);
        
        // Success! Return the valid response
        return NextResponse.json({
          characterResponse: parsedResponse.characterResponse,
          emotion: parsedResponse.emotion,
          evaluation: parsedResponse.evaluation,
          rating: parsedResponse.rating,
          userInput: userInput,
          raw: textResponse,
          attempts: attempt,
        });
        
      } catch (parseError) {
        lastError = parseError instanceof Error ? parseError : new Error(String(parseError));
        console.error(`Attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);
        console.error("Raw response:", lastRawResponse);
        
        // Continue to next attempt
      }
    }

    // All retries failed - return fallback response
    console.error(`All ${MAX_RETRIES} attempts failed. Returning fallback response.`);
    return NextResponse.json({
      characterResponse: "I'm not sure how to respond to that...",
      emotion: "neutral",
      evaluation: "Unable to evaluate the response",
      rating: "neutral",
      userInput: userInput,
      raw: lastRawResponse,
      attempts: MAX_RETRIES,
      error: "Failed to get valid JSON after multiple attempts",
    });

  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
