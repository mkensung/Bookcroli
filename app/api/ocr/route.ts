// app/api/ocr/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const language = formData.get("language") as string | null;

    if (!file) {
      return new Response("No image file provided", { status: 400 });
    }

    // Convert file to base64 for Gemini Vision
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/png";

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const languageHint = language ? ` The text is likely in ${language}.` : "";
    const prompt = `Extract all text from this image. You MUST strictly preserve the exact physical layout of the text.
- If a line ends in the image, insert a line break.
- If there is an empty space or a new paragraph in the image, insert double line breaks (\\n\\n).
- Maintain all structural formatting, indentations, and spacing exactly as they appear visually.
- Do not add any explanations, comments, or markdown formatting.${languageHint}
If no text is found in the image, return an empty string.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("OCR Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to extract text from image", 
        details: error?.message || String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
