import { extractSkills } from "@/parsers/skillParser";

export function scoreResume(resumeText: string, jobDescription: string) {

    // extract skills from resume
    const resumeSkills = extractSkills(resumeText);

    // extract skills from job description
    const jobSkills = extractSkills(jobDescription);

    let matchedSkills: string[] = [];

    for (const skill of jobSkills) {

        if (resumeSkills.includes(skill)) {
            matchedSkills.push(skill);
        }

    }

    const score = Math.round(
        (matchedSkills.length / jobSkills.length) * 100
    );

    return {
        resumeSkills,
        jobSkills,
        matchedSkills,
        score
    };

}