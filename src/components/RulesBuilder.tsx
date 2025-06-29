import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { detectCircularCoRun } from '@/lib/circularCoRunValidator';

interface Task {
  TaskID: string;
  TaskName: string;
}

interface CoRunRule {
  type: 'coRun';
  tasks: string[];
}

interface RuleBuilderProps {
  tasks: Task[];
  rules: CoRunRule[];
  setRules: React.Dispatch<React.SetStateAction<CoRunRule[]>>;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ tasks, rules, setRules }) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [detectedCycles, setDetectedCycles] = useState<string[][]>([]);


  const toggleTask = (taskID: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskID) ? prev.filter((id) => id !== taskID) : [...prev, taskID]
    );
  };

  const addCoRunRule = () => {
    if (selectedTasks.length < 2) {
      toast.error(' Select at least 2 tasks for a co-run rule.');
      return;
    }
  
    const newRule: CoRunRule = { type: 'coRun', tasks: [...selectedTasks] };
    const simulated = [...rules, newRule];
  
    const cycles = detectCircularCoRun(simulated);
  
    if (cycles.length > 0) {
      toast.error(' Adding this rule would create a circular dependency.');
      return;
    }
  
    setRules((prev) => [...prev, newRule]);
    toast.success(' Rule added successfully!');
    setSelectedTasks([]);
  };

  const handleSuggestRules = () => {
    //  Example logic (replace with your own logic later)
    const suggestedRules: CoRunRule[] = [
      { type: 'coRun', tasks: ['T1', 'T2'] },
      { type: 'coRun', tasks: ['T2', 'T3'] },
      { type: 'coRun', tasks: ['T3', 'T1'] },
    ];
  
    const cycles = detectCircularCoRun(suggestedRules);
    setDetectedCycles(cycles);
  
    if (cycles.length > 0) {
      toast.error(' Suggested rules contain circular co-run dependencies!');
      return;
    }
  
    setRules(suggestedRules);
    toast.success(' Co-run rules suggested successfully!');
  };
  
  

  return (
    <div className="flex justify-center mt-10 mb-6">
      <div className="w-full max-w-md p-3 bg-gray-50 border rounded-2xl shadow-sm">
        <h2 className="text-base font-semibold mb-3 text-gray-800 text-center"> Co-Run Rule Builder</h2>

        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {tasks.map((task) => (
            <button
              key={task.TaskID}
              onClick={() => toggleTask(task.TaskID)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                selectedTasks.includes(task.TaskID)
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
              title={task.TaskName}
            >
              {task.TaskID}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={addCoRunRule}
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
             Add Rule
          </button>

          <button
            onClick={handleSuggestRules}
            className="text-sm bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-2 py-1.5 rounded-md shadow-sm transition-all"
          >
            Suggest Co-Run Rules
          </button>
        </div>

        {rules.length > 0  && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">Existing Rules</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {rules.map((rule, i) => (
                <li key={i} className="bg-white rounded-md px-3 py-1 border border-gray-200 shadow-sm">
                  <span className="font-medium text-gray-800">Co-Run:</span> {rule.tasks.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {detectedCycles.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3">
            <p className="font-semibold mb-2">
             {detectedCycles.length} circular co-run rule{detectedCycles.length > 1 ? 's' : ''} detected:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {detectedCycles.map((cycle, i) => (
                <li key={i}>
                  {cycle.join(' → ')}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default RuleBuilder;
