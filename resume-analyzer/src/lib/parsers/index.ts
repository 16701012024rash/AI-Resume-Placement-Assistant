import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODEL_NAME } from "@/lib/ai/gemini";
import path from "path";
import { pathToFileURL } from "url";

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  return new GoogleGenerativeAI(apiKey);
}

async function extractPDFTextLocally(buffer: Buffer): Promise<string> {
  if (typeof globalThis.DOMMatrix === "undefined") {
    (globalThis as any).DOMMatrix = class DOMMatrix {
      constructor() {}
      static fromMatrix() { return new DOMMatrix(); }
      translate() { return this; }
      scale() { return this; }
      rotate() { return this; }
      multiply() { return this; }
      inverse() { return this; }
      toString() { return ""; }
    };
  }
  if (typeof globalThis.ImageData === "undefined") {
    (globalThis as any).ImageData = class ImageData {
      constructor(public data: any, public width: number, public height: number) {}
    };
  }
  if (typeof globalThis.Path2D === "undefined") {
    (globalThis as any).Path2D = class Path2D {
      constructor() {}
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      rect() {}
    };
  }

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    path.join(
      process.cwd(),
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.mjs"
    )
  ).href;

  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let fullText = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

export async function extractPDFTextWithGemini(buffer: Buffer): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const uint8Array = new Uint8Array(buffer);
      const base64Data = Buffer.from(uint8Array).toString("base64");

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data,
          },
        },
        "Extract ALL text from this resume document. Preserve the structure: section headings, bullet points, dates, and formatting. Return ONLY the extracted text, no commentary.",
      ]);

      return result.response.text();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isRateLimited =
        msg.includes("429") ||
        msg.includes("503") ||
        msg.includes("quota") ||
        msg.includes("ResourceExhausted");

      if (isRateLimited) {
        console.warn("Gemini rate-limited for PDF extraction. Falling back to local parser...");
      } else {
        throw error;
      }
    }
  }

  return extractPDFTextLocally(buffer);
}

export async function extractDOCXText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractText(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return extractPDFTextWithGemini(buffer);
    case "docx":
      return extractDOCXText(buffer);
    default:
      throw new Error(
        `Unsupported file format: .${ext}. Please upload a PDF or DOCX file.`
      );
  }
}
