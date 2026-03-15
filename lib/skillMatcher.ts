export function matchSkills(resumeSkills: string[], jdSkills: string[]) {

  const normalize = (skill: string) =>
    skill.toLowerCase().replace(/[^a-z0-9]/g, "");

  const resumeSet = new Set(resumeSkills.map(normalize));

  const matched = jdSkills.filter(skill =>
    resumeSet.has(normalize(skill))
  );

  const missing = jdSkills.filter(skill =>
    !resumeSet.has(normalize(skill))
  );

  const score =
    jdSkills.length === 0
      ? 0
      : Math.round((matched.length / jdSkills.length) * 100);

  return {
    matched,
    missing,
    score
  };
}