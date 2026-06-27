// app/api/translate/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { text, from, to } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are a professional book translator. 
    Translate the following text from ${from} to ${to}. 
    
    IMPORTANT FORMATTING RULES:
    1. You MUST strictly preserve the exact paragraph structure, line breaks, and empty lines of the original text.
    2. If there is a new line or a blank line in the original text, you must replicate it exactly in the translation.
    3. Provide only the translated text without any explanations, comments, or markdown formatting.
    
    Original Text:
    "${text}"`;

    // 🚀 1. เปลี่ยนคำสั่งเป็น generateContentStream เพื่อให้ AI ค่อยๆ พ่นคำออกมา
    const result = await model.generateContentStream(prompt);

    // 🚀 2. สร้างท่อส่งข้อมูล (ReadableStream) ทยอยส่งกลับไปหน้าบ้าน
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      }
    });

    // 🚀 3. ส่งข้อมูลกลับไปแบบสายน้ำ (Text Stream)
    return new Response(stream, { 
      headers: { "Content-Type": "text/plain; charset=utf-8" } 
    });

  } catch (error) {
    console.error("AI Translation Error:", error);
    return new Response("Failed to translate", { status: 500 });
  }
}