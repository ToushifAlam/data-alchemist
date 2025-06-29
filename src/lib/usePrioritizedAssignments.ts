// lib/usePrioritizedAssignments.ts

interface Client {
    ClientID: string;
    RequestedTaskIDs: string;
    PriorityLevel: string;
  }
  
  interface Task {
    TaskID: string;
    RequiredSkills: string;
    Duration: number;
  }
  
  interface Worker {
    WorkerID: string;
    Skills: string;
  }
  
  interface Assignment {
    clientId: string;
    taskId: string;
    suggestedWorkerIds: string[];
  }
  
  export function getPrioritizedAssignments(
    clients: Client[],
    tasks: Task[],
    workers: Worker[]
  ): Assignment[] {
    const priorityMap: Record<string, number> = {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
    };
  
    const parsedClients = [...clients].sort(
      (a, b) => priorityMap[a.PriorityLevel as keyof typeof priorityMap] - priorityMap[b.PriorityLevel as keyof typeof priorityMap]
    );
  
    const taskMap = new Map<string, Task>();
    tasks.forEach((task) => {
      taskMap.set(task.TaskID, task);
    });
  
    const assignments: Assignment[] = [];
  
    parsedClients.forEach((client) => {
      const taskIDs = client.RequestedTaskIDs.split(',').map((t) => t.trim());
      taskIDs.forEach((taskId) => {
        const task = taskMap.get(taskId);
        if (!task) return;
  
        const requiredSkills = task.RequiredSkills.replaceAll('[', '').replaceAll(']', '').split(',').map(s => s.trim());
  
        const suitableWorkers = workers.filter((worker) => {
          const workerSkills = worker.Skills.split(',').map((s) => s.trim());
          return requiredSkills.every((req) => workerSkills.includes(req));
        });
  
        assignments.push({
          clientId: client.ClientID,
          taskId: task.TaskID,
          suggestedWorkerIds: suitableWorkers.map(w => w.WorkerID),
        });
      });
    });
  
    return assignments;
  }
  