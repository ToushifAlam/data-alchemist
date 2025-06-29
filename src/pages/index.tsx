import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import {
  validateClients,
  validateWorkers,
  validateTasks,
  ValidationError,
  crossValidate,
} from '@/lib/validators';
import ErrorSummary from '@/components/ErrorSummary';
import DownloadButton from '@/components/DownloadButton';
import toast from 'react-hot-toast';
import SummaryPanel from '@/components/SummaryPanel';
import DownloadAllButton from '@/components/DownloadAllButton';
import CrossValidationPanel from '@/components/CrossValidationPanel';
import { getCrossValidationIssues } from '@/lib/crossValidator';
import DownloadJsonButton from '@/components/DownloadJsonButton';
import { detectCircularCoRun, CoRunRule } from '@/lib/circularCoRunValidator';
import RuleBuilder from '@/components/RulesBuilder';
import DownloadRulesButton from '@/components/DownloadRulesButton';
import { getPrioritizedAssignments } from '@/lib/usePrioritizedAssignments';
import AssignmentPanel, { Assignment } from '@/components/AssignmentPanel';
import DownloadAssignmentsButton from '@/components/DownloadAssignmentsButton';
import { parseNaturalRule } from '@/lib/naturalRuleParser';



export default function Home() {
  const [clients, setClients] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [crossIssues, setCrossIssues] = useState<string[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [nlRuleText, setNlRuleText] = useState('');


  const runValidations = (
    clientsData: any[],
    workersData: any[],
    tasksData: any[]
  ) => {
    const clientErrors: ValidationError[] = validateClients(clientsData).map((err) => ({
      ...err,
      entity: 'clients',
    }));
  
    const workerErrors: ValidationError[] = validateWorkers(workersData).map((err) => ({
      ...err,
      entity: 'workers',
    }));
  
    const taskErrors: ValidationError[] = validateTasks(tasksData).map((err) => ({
      ...err,
      entity: 'tasks',
    }));
  
    const crossErrors: ValidationError[] = crossValidate(clientsData, workersData, tasksData).map((err) => ({
      ...err,
      entity: 'cross',
    }));
  
    const allErrors: ValidationError[] = [
      ...clientErrors,
      ...workerErrors,
      ...taskErrors,
      ...crossErrors,
    ];
  
    setErrors(allErrors);
    setCrossIssues(getCrossValidationIssues(crossErrors));
  
    if (allErrors.length === 0) {
      toast.success("All data validated successfully!");
      const suggestedAssignments = getPrioritizedAssignments(clientsData, tasksData, workersData);
      setAssignments(suggestedAssignments);
    }    
  };
  


  const handleDataParsed = (type: 'clients' | 'workers' | 'tasks', data: any[]) => {
    const newClients = type === 'clients' ? data : clients;
    const newWorkers = type === 'workers' ? data : workers;
    const newTasks = type === 'tasks' ? data : tasks;

    if (type === 'clients') setClients(data);
    if (type === 'workers') setWorkers(data);
    if (type === 'tasks') setTasks(data);

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded`);
    runValidations(newClients, newWorkers, newTasks);
  };

  const handleSetData = (type: 'clients' | 'workers' | 'tasks', updatedData: any[]) => {
    const newClients = type === 'clients' ? updatedData : clients;
    const newWorkers = type === 'workers' ? updatedData : workers;
    const newTasks = type === 'tasks' ? updatedData : tasks;

    if (type === 'clients') setClients(updatedData);
    if (type === 'workers') setWorkers(updatedData);
    if (type === 'tasks') setTasks(updatedData);

    runValidations(newClients, newWorkers, newTasks);
  };

  const countErrorsForEntity = (entity: 'clients' | 'workers' | 'tasks'): number => {
    const fieldMap = {
      clients: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'AttributesJSON'],
      workers: ['WorkerID', 'WorkerName', 'Skills'],
      tasks: ['TaskID', 'Duration', 'RequiredSkills'],
    };
  
    return errors.filter(e => {
      if (e.entity === entity) return true;
      if (e.entity === 'cross') {
        return fieldMap[entity].includes(e.field);
      }
      return false;
    }).length;
  };


  const testCoRunRules: CoRunRule[] = [
    { type: 'coRun', tasks: ['A', 'B'] },
    { type: 'coRun', tasks: ['B', 'C'] },
    { type: 'coRun', tasks: ['C', 'A'] },
  ];
  
  const cycles = detectCircularCoRun(testCoRunRules);
  console.log('Detected Cycles:', cycles);

  const circularRuleGroups = detectCircularCoRun(rules);

  useEffect(() => {
    if (clients.length > 0 && tasks.length > 0 && workers.length > 0) {
      const result = getPrioritizedAssignments(clients, tasks, workers);
      setAssignments(result);
    }
  }, [clients, tasks, workers]);


  const handleSuggestRules = async () => {
    try {
      const res = await fetch('/api/rule-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients, tasks, workers }),
      });
      const data = await res.json();
      if (data.rules) {
        setRules([...rules, ...data.rules]);
        toast.success('AI rule suggestions added!');
      } else {
        toast.error('No rules returned');
      }
    } catch (err) {
      toast.error('Failed to get AI suggestions');
      console.error(err);
    }
  };
  
  
  

  return (
    <>
      <Head>
        <title>Data Alchemist</title>
      </Head>
      <main className="p-4 max-w-6xl mx-auto font-sans text-gray-800">
        <h1 className="text-2xl font-bold mb-4"> Data Alchemist – Spreadsheet Simplifier</h1>

        <FileUploader onDataParsed={handleDataParsed} />

        {tasks.length > 0 && (
  <>
    <RuleBuilder tasks={tasks} rules={rules} setRules={setRules} />

    <div className="max-w-md mx-auto mt-4 mb-2 flex gap-2">
      <input
        type="text"
        placeholder="e.g. Make A, B and C co-run"
        value={nlRuleText}
        onChange={(e) => setNlRuleText(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg shadow-sm text-sm"
      />
      <button
        onClick={() => {
          const parsedRule = parseNaturalRule(nlRuleText);
          if (parsedRule) {
            setRules([...rules, parsedRule]);
            toast.success('Rule added from text!');
            setNlRuleText('');
          } else {
            toast.error('Could not understand the rule.');
          }
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm"
      >
        Add Rule
      </button>
    </div>

    <div className="max-w-md mx-auto mb-6 text-center">
      <button
        onClick={handleSuggestRules}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm"
      >
         Suggest Rules with AI
      </button>
    </div>
  </>
)}



        {circularRuleGroups.length > 0 && (
          <div className="max-w-md mx-auto mt-2 mb-8 bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-sm text-sm">
            <strong>{circularRuleGroups.length}</strong> circular co-run rule
            {circularRuleGroups.length > 1 ? 's' : ''} detected:
              <ul className="mt-1 list-disc list-inside">
                {circularRuleGroups.map((group, idx) => (
                  <li key={idx}>{group.join(' → ')} → {group[0]}</li>
                ))}
            </ul>
          </div>
        )}



        <div className="flex flex-wrap justify-center gap-6 my-4">
          <div className="w-full md:w-auto">
            <ErrorSummary errors={errors} />
          </div>
          <div className="w-full md:w-auto">
            <CrossValidationPanel issues={crossIssues} />
          </div>
        </div>

        {(clients.length > 0 || workers.length > 0 || tasks.length > 0) && (
          <>
            <SummaryPanel
              dataCounts={{
                clients: clients.length,
                workers: workers.length,
                tasks: tasks.length,
              }}
              errorCounts={{
                clients: countErrorsForEntity('clients'),
                workers: countErrorsForEntity('workers'),
                tasks: countErrorsForEntity('tasks'),
              }}
            />
            
            <AssignmentPanel assignments={assignments} />

            {tasks.length > 0 && (
            <div className="flex justify-center my-4 gap-4">
              <button
                onClick={() => {
                  const newAssignments = getPrioritizedAssignments(clients, tasks, workers);
                  console.log("Suggested Assignments:", newAssignments);
                  setAssignments([...newAssignments]); // ensure a new array reference
                  toast.success("Assignments updated!");
                }}                
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Suggest Assignments
              </button>

              {assignments.length > 0 && (
                <DownloadAssignmentsButton assignments={assignments} />
              )}
            </div>
            )}

          </>
        )}
        



        {(clients.length > 0 || workers.length > 0 || tasks.length > 0)  && (
          <button
            onClick={() => {
              setClients([]);
              setWorkers([]);
              setTasks([]);
              setErrors([]);
              toast.success('All data reset!');
            }}
            className="mt-6 mb-4 bg-red-600 hover:bg-red-700 text-white font-semibold tracking-wide text-sm md:text-base px-2.5 py-1.5 rounded-lg shadow transition-all duration-200"
          >
             Reset All Data
          </button>
        )}

        {/* Clients */}
        <DataTable
          type="clients"
          data={clients}
          setData={handleSetData}
          errors={errors}
        />
        {clients.length > 0 && <DownloadButton type="clients" data={clients} errors={errors} />}

        {/* Workers */}
        <div className="mt-12">
          <DataTable
            type="workers"
            data={workers}
            setData={handleSetData}
            errors={errors}
          />
          {workers.length > 0 && <DownloadButton type="workers" data={workers} errors={errors} />}
        </div>

        {/* Tasks */}
        <div className="mt-12">
          <DataTable
            type="tasks"
            data={tasks}
            setData={handleSetData}
            errors={errors}
          />
          {tasks.length > 0 && <DownloadButton type="tasks" data={tasks} errors={errors} />}
        </div>


        
        <div className="flex justify-center flex-wrap gap-4 my-6">
          {rules.length > 0 && (
            <DownloadRulesButton rules={rules} />
          )}
          {clients.length > 0 && workers.length > 0 && tasks.length > 0 && (
            <>
              {errors.length === 0 && (
                <DownloadJsonButton clients={clients} workers={workers} tasks={tasks} />
              )}
              <DownloadAllButton clients={clients} workers={workers} tasks={tasks} />
            </>
          )}
        </div>

        


      </main>
    </>
  );
}
