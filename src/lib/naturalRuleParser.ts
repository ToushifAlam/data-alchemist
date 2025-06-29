import { CoRunRule } from './circularCoRunValidator';

export function parseNaturalRule(input: string): CoRunRule | null {
  const lower = input.toLowerCase().trim();
  const match = lower.match(/(?:make|add)?\s*([\w,\s]+?)\s*(?:and)?\s*([\w]+)?\s*co-?run/);

  if (!match) return null;

  let tasks: string[] = match[1]
    .split(',')
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);

  if (match[2]) {
    tasks.push(match[2].trim().toUpperCase());
  }

  if (tasks.length < 2) return null;

  return { type: 'coRun', tasks };
}
