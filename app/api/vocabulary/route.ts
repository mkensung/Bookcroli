import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { word } = await req.json();

    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a dictionary assistant. The user wants to learn the English word: "${word}".
Provide the following information about this word in JSON format:
{
  "phonetic": "IPA pronunciation, e.g. /'wɪtnəs/",
  "thaiReading": "Thai transliteration/reading of the pronunciation, e.g. วิท'นิส",
  "partOfSpeech": "Part of speech, e.g. noun, verb, adjective",
  "translation": "Thai translation, e.g. พยาน, ผู้เห็น",
  "examples": [
    "An example sentence using the word in English.",
    "Another example sentence using the word in English."
  ]
}
Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Vocabulary translation error:", error);
    return NextResponse.json({ error: "Failed to translate word" }, { status: 500 });
  }
}
