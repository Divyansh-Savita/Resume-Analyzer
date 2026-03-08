import { NextResponse } from "next/server";
import { extractSkills } from "@/parsers/skillParser";

export async function POST(req: Request) {

    try {

        const body = await req.json();
        const jobDescription = body.jobDescription;

        if (!jobDescription) {
            return NextResponse.json(
                { error: "Job description required" },
                { status: 400 }
            );
        }

        // extract required skills from job description
        const skills = extractSkills(jobDescription);

        return NextResponse.json({
            requiredSkills: skills,
            totalRequiredSkills: skills.length
        });

    } catch (error: any) {

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );

    }

}