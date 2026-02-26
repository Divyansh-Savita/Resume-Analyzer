import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("resumes")
      .upload(fileName, file);

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
    }

    // Save record in DB
    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          original_filename: file.name,
          file_path: fileName,
          score: 0
        }
      ])
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return Response.json({ data });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}