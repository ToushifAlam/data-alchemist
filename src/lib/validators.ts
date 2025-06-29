export interface ValidationError {
    type: string;
    message: string;
    entity: 'clients' | 'workers' | 'tasks' | 'cross';
    row: number;
    field: string;
  }
  
  export const validateClients = (clients: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
  
    const requiredColumns = ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs'];
  
    clients.forEach((client, rowIdx) => {
      requiredColumns.forEach((col) => {
        if (!client[col]) {
          errors.push({
            type: 'MissingColumn',
            message: `Missing value for ${col}`,
            entity: 'clients',
            row: rowIdx,
            field: col,
          });
        }
      });
  
      const priority = parseInt(client['PriorityLevel']);
      if (isNaN(priority) || priority < 1 || priority > 5) {
        errors.push({
          type: 'InvalidPriority',
          message: `PriorityLevel should be between 1 and 5`,
          entity: 'clients',
          row: rowIdx,
          field: 'PriorityLevel',
        });
      }
  
      try {
        if (client['AttributesJSON']) {
          JSON.parse(client['AttributesJSON']);
        }
      } catch {
        errors.push({
          type: 'InvalidJSON',
          message: `AttributesJSON is not valid JSON`,
          entity: 'clients',
          row: rowIdx,
          field: 'AttributesJSON',
        });
      }
    });
  
    return errors;
  };
  
  export const validateWorkers = (workers: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const seenIDs = new Set();
  
    workers.forEach((worker, rowIdx) => {
      if (!worker.WorkerID) {
        errors.push({
          type: 'MissingWorkerID',
          message: 'WorkerID is required',
          entity: 'workers',
          row: rowIdx,
          field: 'WorkerID',
        });
      } else if (seenIDs.has(worker.WorkerID)) {
        errors.push({
          type: 'DuplicateWorkerID',
          message: `Duplicate WorkerID ${worker.WorkerID}`,
          entity: 'workers',
          row: rowIdx,
          field: 'WorkerID',
        });
      }
      seenIDs.add(worker.WorkerID);
  
      if (!worker.WorkerName) {
        errors.push({
          type: 'MissingWorkerName',
          message: 'WorkerName is required',
          entity: 'workers',
          row: rowIdx,
          field: 'WorkerName',
        });
      }
    });
  
    return errors;
  };
  
  export const validateTasks = (tasks: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const seenIDs = new Set();
  
    tasks.forEach((task, rowIdx) => {
      if (!task.TaskID) {
        errors.push({
          type: 'MissingTaskID',
          message: 'TaskID is required',
          entity: 'tasks',
          row: rowIdx,
          field: 'TaskID',
        });
      } else if (seenIDs.has(task.TaskID)) {
        errors.push({
          type: 'DuplicateTaskID',
          message: `Duplicate TaskID ${task.TaskID}`,
          entity: 'tasks',
          row: rowIdx,
          field: 'TaskID',
        });
      }
      seenIDs.add(task.TaskID);
  
      if (!task.Duration || isNaN(Number(task.Duration))) {
        errors.push({
          type: 'InvalidDuration',
          message: 'Duration must be a number',
          entity: 'tasks',
          row: rowIdx,
          field: 'Duration',
        });
      }
    });
  
    return errors;
  };



  export const crossValidate = (
    clients: any[],
    workers: any[],
    tasks: any[]
  ): ValidationError[] => {
    const errors: ValidationError[] = [];
  
    // Collect all valid TaskIDs
    const taskIDs = new Set(tasks.map((task) => task.TaskID?.toString().trim()));
  
    // Collect all required skills from tasks
    const allRequiredSkills = new Set(
      tasks
        .flatMap((task) =>
          task.RequiredSkills?.replaceAll('[', '').replaceAll(']', '').split(',') || []
        )
        .map((skill: string) => skill.trim())
        .filter(Boolean)
    );
  
    // Validate clients → RequestedTaskIDs exist in tasks
    clients.forEach((client, rowIdx) => {
      const taskList = (client.RequestedTaskIDs || '').split(',');
      taskList.forEach((taskID: string) => {
        const trimmed = taskID.trim();
        if (trimmed && !taskIDs.has(trimmed)) {
          errors.push({
            type: 'InvalidTaskReference',
            message: `TaskID ${trimmed} does not exist in tasks`,
            entity: 'clients',
            row: rowIdx,
            field: 'RequestedTaskIDs',
          });
        }
      });
    });
  
    // Validate workers → Skills exist in any task's RequiredSkills
    workers.forEach((worker, rowIdx) => {
      const skills = (worker.Skills || '').split(',');
      skills.forEach((skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !allRequiredSkills.has(trimmed)) {
          errors.push({
            type: 'UnusedSkill',
            message: `Skill ${trimmed} is not required by any task`,
            entity: 'workers',
            row: rowIdx,
            field: 'Skills',
          });
        }
      });
    });
  
    return errors;
  };
  
  