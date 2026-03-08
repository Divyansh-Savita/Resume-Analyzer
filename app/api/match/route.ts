import { NextResponse } from "next/server";
import { extractSkills } from "@/parsers/skillParser";

export async function POST(req: Request) {
    try {

        const { resumeText, jobDescription } = await req.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: "Resume text and job description are required" },
                { status: 400 }
            );
        }

        // extract skills from resume
        const resumeSkills = extractSkills(resumeText);

        // extract skills from job description
        const jobSkills = extractSkills(jobDescription);

        // find matched skills
        const matchedSkills = jobSkills.filter(skill =>
            resumeSkills.includes(skill)
        );

        // find missing skills
        const missingSkills = jobSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );

        // calculate ATS score
        const score =
            jobSkills.length === 0
                ? 0
                : Math.round((matchedSkills.length / jobSkills.length) * 100);

        return NextResponse.json({
            score,
            resumeSkills,
            jobSkills,
            matchedSkills,
            missingSkills
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Matching failed" },
            { status: 500 }
        );
    }
}