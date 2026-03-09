import { NextResponse } from "next/server";
import { extractSkills } from "@/parsers/skillParser";
import { extractSkillsAI } from "@/lib/ai";

export async function POST(req: Request) {
    try {

        const { resumeText, jobDescription } = await req.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: "Resume text and job description are required" },
                { status: 400 }
            );
        }

        // ⭐ Extract skills using AI
        const resumeSkillsAI = await extractSkillsAI(resumeText);
        const jobSkillsAI = await extractSkillsAI(jobDescription);

        const resumeSkills = resumeSkillsAI.skills;
        const jobSkills = jobSkillsAI.skills;

        // ⭐ Find matched skills
        const matchedSkills = jobSkills.filter(skill =>
            resumeSkills.includes(skill)
        );

        // ⭐ Find missing skills
        const missingSkills = jobSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );

        // ⭐ Calculate ATS score
        const score =
            jobSkills.length === 0
                ? 0
                : Math.round((matchedSkills.length / jobSkills.length) * 100);

        console.log("ATS Score:", score);
        console.log("Matched Skills:", matchedSkills);
        console.log("Missing Skills:", missingSkills);
        console.log("Resume Skills:", resumeSkills);
        console.log("Job Skills:", jobSkills);
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