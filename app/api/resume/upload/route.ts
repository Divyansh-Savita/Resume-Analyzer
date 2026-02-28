import { supabase } from "@/lib/supabaseClient";

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

//     // convert file to arraybuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

//     // Upload to Supabase Storage
    const {  error: uploadError } = await supabase
      .storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
      });


    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
    }

    const { error } = await supabase
  .from("resumes")
  .insert([
    {
      original_filename: file.name,
      extracted_text: "",
      score: 0
    }
  ]);

if (error) {
  return Response.json({ error: error.message }, { status: 500 });
}

    return Response.json({ message: "Upload successful" });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}