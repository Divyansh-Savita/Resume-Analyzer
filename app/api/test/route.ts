import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("resumes")
    .select("*");

  if (error) {
    return Response.json({ error: error.message });
  }

  return Response.json({ data });
}
