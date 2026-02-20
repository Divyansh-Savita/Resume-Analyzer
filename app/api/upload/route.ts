import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file → buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamically import pdf-parse
    const pdfParse = (await import("pdf-parse")) as any;

    // Extract text
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    console.log("Extracted Resume Text:");
    console.log(text);

    return NextResponse.json({
      message: "PDF processed successfully",
      preview: text.substring(0, 500),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}
