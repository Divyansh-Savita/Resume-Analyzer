import { SKILL_MAP } from "../data/skills";

export function extractSkills(text: string) {

    const lowerText = text.toLowerCase();

    const detectedSkills: string[] = [];

    for (const skill in SKILL_MAP) {

        const variations = SKILL_MAP[skill];

        for (const keyword of variations) {

            if (lowerText.includes(keyword)) {

                detectedSkills.push(skill);
                break;

            }

        }

    }

    return detectedSkills;

}