export const SKILL_LEVEL_VALUES = ['beginner', 'intermediate', 'advanced', 'comp'] as const;
export const POSITION_VALUES = ['Guard', 'Forward', 'Centre', 'Any'] as const;

export type SkillLevel = (typeof SKILL_LEVEL_VALUES)[number];
export type Position = (typeof POSITION_VALUES)[number];

export const SKILL_LEVELS: { key: SkillLevel; label: string }[] = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'comp', label: 'Comp' },
];
