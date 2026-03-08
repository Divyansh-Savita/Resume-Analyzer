import { extractSkills } from "@/parsers/skillParser";
import { supabase } from "@/lib/supabaseClient";
// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const cleanName = file.name
      .replace(/\s+/g, "_")        // replace spaces
      .replace(/[^\w.-]/g, "");    // remove special chars

    const fileName = `${Date.now()}-${cleanName}`;

    // Convert file to Buffer (pdf-parse needs Buffer)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // ✅ PDF PARSE
    const pdfData = await pdfParse(buffer);
    const extractedText: string = pdfData.text;

    console.log("Extracted length:", extractedText.length);

    // Extract skills
    const skills = extractSkills(extractedText);
    console.log("Skills found:", skills);
    //     // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
      });


    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
    }

    const { error: dbError } = await supabase
      .from("resumes")
      .insert([
        {
          original_filename: file.name,
          file_path: fileName,
          extracted_text: extractedText,  // 🔥 use the extracted text
          score: 0,
          detected_skills: skills, //added:store detected skills in db
        },
      ]);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 500 });
    }

    return Response.json({
      message: "Upload successful",
      length: extractedText.length,
      extractedText: extractedText,
      detectedSkills: skills,
      totalSkills: skills.length
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}