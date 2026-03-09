export default function AIAnalysis({ data }: any) {

    return (
        <div>

            <h2>Matched Skills</h2>
            <ul>
                {data.matchedSkills.map((skill: string, i: number) => (
                    <li key={i}>{skill}</li>
                ))}
            </ul>

            <h2>Missing Skills</h2>
            <ul>
                {data.missingSkills.map((skill: string, i: number) => (
                    <li key={i}>{skill}</li>
                ))}
            </ul>

            <h2>Suggestions</h2>
            <ul>
                {data.suggestions.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                ))}
            </ul>

        </div>
    );
}