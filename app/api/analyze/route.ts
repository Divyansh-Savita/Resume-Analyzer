import { NextResponse } from "next/server";
import { extractSkills } from "@/parsers/skillParser";

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        const skills = extractSkills(text);

        return NextResponse.json({
            skills,
            totalSkills: skills.length
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to analyze resume" },
            { status: 500 }
        );
    }
}