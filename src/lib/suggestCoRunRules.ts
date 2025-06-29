import { CoRunRule } from './circularCoRunValidator';

export function suggestCoRunRules(tasks: any[]): CoRunRule[] {
  const suggestions: CoRunRule[] = [];
  const grouped: Record<string, string[]> = {};

  tasks.forEach(task => {
    const durationKey = Math.round(Number(task.Duration) / 10) * 10 + 'min'; // Group by duration
    if (!grouped[durationKey]) grouped[durationKey] = [];
    grouped[durationKey].push(task.TaskID);
  });

  Object.values(grouped).forEach(group => {
    if (group.length >= 2) {
      suggestions.push({ type: 'coRun', tasks: group });
    }
  });

  return suggestions;
}
