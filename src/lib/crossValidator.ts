// ✅ Updated crossValidators.ts
import { ValidationError } from './validators';

export const getCrossValidationIssues = (
  errors: ValidationError[]
): string[] => {
  // Filter using type instead of entity for cross-validation-specific issues
  const crossErrors = errors.filter((e) =>
    ['InvalidTaskReference', 'UnusedSkill'].includes(e.type)
  );

  const issueMap: Record<string, number> = {};

  crossErrors.forEach((error) => {
    const message = error.message || 'Unknown cross validation error';
    issueMap[message] = (issueMap[message] || 0) + 1;
  });

  return Object.entries(issueMap).map(
    ([msg, count]) => `${msg} (${count} issue${count > 1 ? 's' : ''})`
  );
};


// ✅ Updated crossValidate() inside validators.ts
export const crossValidate = (
  clients: any[],
  workers: any[],
  tasks: any[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const taskIDs = new Set(tasks.map((task) => task.TaskID?.toString().trim()));
  const allRequiredSkills = new Set(
    tasks
      .flatMap((task) =>
        task.RequiredSkills?.replaceAll('[', '').replaceAll(']', '').split(',') || []
      )
      .map((skill: string) => skill.trim())
      .filter(Boolean)
  );

  clients.forEach((client, rowIdx) => {
    const taskList = (client.RequestedTaskIDs || '').split(',');
    taskList.forEach((taskID: string) => {
      const trimmed = taskID.trim();
      if (trimmed && !taskIDs.has(trimmed)) {
        errors.push({
          type: 'InvalidTaskReference',
          message: `TaskID ${trimmed} does not exist in tasks`,
          entity: 'clients', // ✅ Changed from 'cross'
          row: rowIdx,
          field: 'RequestedTaskIDs',
        });
      }
    });
  });

  workers.forEach((worker, rowIdx) => {
    const skills = (worker.Skills || '').split(',');
    skills.forEach((skill: string) => {
      const trimmed = skill.trim();
      if (trimmed && !allRequiredSkills.has(trimmed)) {
        errors.push({
          type: 'UnusedSkill',
          message: `Skill ${trimmed} is not required by any task`,
          entity: 'workers', // ✅ Changed from 'cross'
          row: rowIdx,
          field: 'Skills',
        });
      }
    });
  });

  return errors;
};