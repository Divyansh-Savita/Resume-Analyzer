import { NextResponse } from "next/server";
import { analyzeResumeAI } from "@/lib/ai";

export async function POST(req: Request) {

    const { resumeText, jobText } = await req.json();

    const result = await analyzeResumeAI(resumeText, jobText);

    return NextResponse.json({
        analysis: result
    });
}