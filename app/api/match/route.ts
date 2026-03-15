import { NextResponse } from "next/server";
// import { extractSkills } from "@/parsers/skillParser";
import { extractSkillsAI } from "@/lib/ai";
import { log } from "console";
import { SKILL_MAP } from "@/data/skills";

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

        let resumeSkills: string[] = [];
        const rsRaw = resumeSkillsAI?.skills;
        if (Array.isArray(rsRaw)) {
            resumeSkills = rsRaw
                .map((s: any) => typeof s === "string" ? s : (s?.text || s?.name || ""))
                .filter(Boolean);
        } else if (rsRaw && typeof rsRaw === "object") {
            resumeSkills = Object.values(rsRaw)
                .map((s: any) => typeof s === "string" ? s : (s?.text || s?.name || ""))
                .filter(Boolean);
        }

        let jobSkills: string[] = [];
        const jsRaw = jobSkillsAI?.skills;
        if (Array.isArray(jsRaw)) {
            jobSkills = jsRaw
                .map((s: any) => typeof s === "string" ? s : (s?.text || s?.name || ""))
                .filter(Boolean);
        } else if (jsRaw && typeof jsRaw === "object") {
            jobSkills = Object.values(jsRaw)
                .map((s: any) => typeof s === "string" ? s : (s?.text || s?.name || ""))
                .filter(Boolean);
        }

    const normalize = (skill: string) => {
      let lower = skill.toLowerCase().trim();
      lower = lower.replace(/\([^)]*\)/g, "").trim();
      lower = lower.replace(/\bstack\b/gi, "").trim();

      for (const [canonical, aliases] of Object.entries(SKILL_MAP)) {
        if (canonical === lower || aliases.includes(lower)) {
          return canonical;
        }
      }
      return lower.replace(/\.js$/, "").replace(/[^a-z0-9+#]/g, "");
    };

    // expand job skills like HTML/CSS -> HTML, CSS
    const expandedJobSkills = jobSkills.flatMap((skill:string) => {
      if (typeof skill !== "string") return [];
      return skill.split(/[\/,]|\band\b|&/i).map((s:string) => s.trim()).filter(Boolean);
    });

    // expand resume skills exactly like job skills
    const expandedResumeSkills = resumeSkills.flatMap((skill:string) => {
      if (typeof skill !== "string") return [];
      return skill.split(/[\/,]|\band\b|&/i).map((s:string) => s.trim()).filter(Boolean);
    });

    // Deduplicate job skills to ensure accurate scoring
    const seenNormalizedJobSkills = new Set<string>();
    const uniqueExpandedJobSkills = expandedJobSkills.filter(skill => {
        const norm = normalize(skill);
        if (!norm || seenNormalizedJobSkills.has(norm)) return false;
        seenNormalizedJobSkills.add(norm);
        return true;
    });

    // Deduplicate resume skills for a cleaner response
    const seenNormalizedResumeSkills = new Set<string>();
    const uniqueExpandedResumeSkills = expandedResumeSkills.filter(skill => {
        const norm = normalize(skill);
        if (!norm || seenNormalizedResumeSkills.has(norm)) return false;
        seenNormalizedResumeSkills.add(norm);
        return true;
    });

    // Convert resume skills into a normalized Set for fast lookup
    const resumeSet = new Set(uniqueExpandedResumeSkills.map(normalize));

    // ⭐ Find matched skills
    const matchedSkills = uniqueExpandedJobSkills.filter((skill: string)=> {
        const norm = normalize(skill);
        if (norm === "mern") {
            return ["mongodb", "express", "react", "node"].every(s => resumeSet.has(s));
        }
        if (norm === "mean") {
            return ["mongodb", "express", "angular", "node"].every(s => resumeSet.has(s));
        }
        return resumeSet.has(norm);
    });

    // ⭐ Find missing skills
    const missingSkills = uniqueExpandedJobSkills.filter((skill:string )=> {
        const norm = normalize(skill);
        if (norm === "mern") {
            return !["mongodb", "express", "react", "node"].every(s => resumeSet.has(s));
        }
        if (norm === "mean") {
            return !["mongodb", "express", "angular", "node"].every(s => resumeSet.has(s));
        }
        return !resumeSet.has(norm);
    });

    // ⭐ Calculate ATS score
    const score =
        uniqueExpandedJobSkills.length === 0
            ? 0
            : Math.round((matchedSkills.length / uniqueExpandedJobSkills.length) * 100);

    const suggestions = missingSkills.length > 0 
        ? missingSkills.map((skill: string) => `Consider adding ${skill} to your resume if you have experience with it.`)
        : [];

    console.log("Job Skills:", uniqueExpandedJobSkills);
    console.log("Resume Skills:", uniqueExpandedResumeSkills);
    console.log("Matched Skills:", matchedSkills);
    console.log("Missing Skills:", missingSkills);

    return NextResponse.json({
        score,
        resumeSkills: uniqueExpandedResumeSkills,
        jobSkills: uniqueExpandedJobSkills,
        matchedSkills,
        missingSkills,
        suggestions
    });

    } catch (error) {
        console.error("Match Error:",error);
        
        return NextResponse.json(
            { error: "Matching failed" },
            { status: 500 }
        );
    }
}