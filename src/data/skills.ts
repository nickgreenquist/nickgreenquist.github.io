export interface SkillGroup {
  label: string;
  tags: string[];
}

export const skillGroups: SkillGroup[] = [
  { label: 'Languages', tags: ['Python', 'C++', 'Java', 'SQL', 'JavaScript'] },
  { label: 'ML / AI', tags: ['Machine Learning', 'Recommendation Systems', 'PyTorch', 'TensorFlow', 'Distributed Systems', 'MapReduce'] },
  { label: 'Web', tags: ['Node.js', 'React', 'HTML', 'CSS'] },
  { label: 'Tools', tags: ['Git', 'Bash', 'Claude Code', 'Gemini CLI'] },
];
