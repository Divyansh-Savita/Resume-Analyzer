import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function analyzeResumeAI(resumeText: string, jobText: string) {

    const prompt = `
Compare the resume and job description.

Resume:
${resumeText}

Job Description:
${jobText}

Return ONLY JSON in this format:

{
 "matchedSkills": [],
 "missingSkills": [],
 "suggestions": []
}

Do not return explanations or markdown.
`;

    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
    });

    const content = response.choices[0].message.content || "{}";

    try {
        const cleaned = content.replace(/```json/i, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch {
        return { error: "AI returned invalid JSON", raw: content };
    }
}

// ⭐ ADD THIS FUNCTION
export async function extractSkillsAI(text: string): Promise<{ skills: string[] }> {

    const prompt = `
Extract ONLY technical skills from the text.

Include:
- programming languages
- frameworks
- libraries
- databases
- developer tools
- backend technologies
- frontend technologies

DO NOT include:
- soft skills
- personality traits
- communication skills
- thinking skills

Return ONLY JSON:

{
 "skills": []
}

Text:
${text}
`;

    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
    });

    const content = response.choices[0].message.content || "{}";

    try {
        const cleaned = content.replace(/```json/i, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned) as { skills: string[] };
    } catch {
        return { skills: [] };
    }
}