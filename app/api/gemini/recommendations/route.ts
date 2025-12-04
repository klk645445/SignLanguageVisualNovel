import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface FeedbackEntry {
  nodeId: string;
  sceneId: string;
  userInput: string;
  evaluation: string;
  rating: "good" | "neutral" | "bad";
  context: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const { feedback, playerName, finalScore } = await request.json();

    if (!feedback || !Array.isArray(feedback)) {
      return NextResponse.json(
        { error: "Feedback array is required" },
        { status: 400 }
      );
    }

    // Build a summary of all feedback
    const feedbackSummary = feedback.map((entry: FeedbackEntry, index: number) => 
      `Interaction ${index + 1}:
- Situation: ${entry.context}
- Player's response: "${entry.userInput}"
- Evaluation: ${entry.evaluation}
- Rating: ${entry.rating}`
    ).join("\n\n");

    // Count ratings
    const goodCount = feedback.filter((f: FeedbackEntry) => f.rating === "good").length;
    const neutralCount = feedback.filter((f: FeedbackEntry) => f.rating === "neutral").length;
    const badCount = feedback.filter((f: FeedbackEntry) => f.rating === "bad").length;

    const prompt = `You are a helpful guide for a visual novel game about learning to communicate with and support a deaf classmate named LK.

The player "${playerName || 'Player'}" has just finished playing the game.

Here is a summary of their interactions throughout the game:

${feedbackSummary}

Rating Summary:
- Good responses: ${goodCount}
- Neutral responses: ${neutralCount}
- Bad responses: ${badCount}
- Final relationship score: ${finalScore ?? 'N/A'}

Please provide personalized feedback for the player. Your response MUST be a valid JSON object with this exact format (no markdown, no code blocks):
{
  "overallAssessment": "A 2-3 sentence overall assessment of how the player did",
  "strengths": ["List 2-3 things the player did well - be specific about their good responses"],
  "areasForImprovement": ["List 2-3 areas where the player could improve - be specific and constructive"],
  "tips": ["List 3-4 practical tips for communicating better with deaf or hard of hearing people in real life"],
  "encouragement": "A short encouraging message for the player"
}

Focus on:
1. Communication strategies with deaf/hard of hearing individuals
2. Being patient and understanding
3. Choosing appropriate environments for conversation
4. Being inclusive and considerate

Respond ONLY with the JSON object:`;

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
          maxOutputTokens: 2048,
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
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from Gemini" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Try to parse the JSON response
    try {
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

      const parsedResponse = JSON.parse(cleanedResponse);
      
      return NextResponse.json({
        overallAssessment: parsedResponse.overallAssessment || "Good effort throughout the game!",
        strengths: parsedResponse.strengths || ["You tried to communicate with LK"],
        areasForImprovement: parsedResponse.areasForImprovement || ["Keep practicing!"],
        tips: parsedResponse.tips || ["Be patient when communicating"],
        encouragement: parsedResponse.encouragement || "Great job completing the game!",
      });
    } catch (parseError) {
      console.error("Failed to parse recommendations JSON:", parseError);
      console.error("Raw response:", textResponse);
      
      // Return fallback response
      return NextResponse.json({
        overallAssessment: "You completed the game! Thank you for learning about communicating with deaf individuals.",
        strengths: ["You completed all the interactions", "You showed interest in learning"],
        areasForImprovement: ["Keep practicing inclusive communication"],
        tips: [
          "Face the person when speaking to help with lip reading",
          "Choose quiet environments for important conversations",
          "Be patient and willing to repeat or rephrase",
          "Learn some basic sign language greetings"
        ],
        encouragement: "Every interaction is a chance to learn and grow. Keep being curious and kind!",
      });
    }
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
