export interface CoRunRule {
    type: 'coRun';
    tasks: string[];
  }
  
  // Detect circular co-run groups (e.g. A → B → C → A)
  export function detectCircularCoRun(rules: CoRunRule[]): string[][] {
    const graph: Record<string, Set<string>> = {};
  
    rules.forEach(rule => {
      rule.tasks.forEach(task => {
        if (!graph[task]) graph[task] = new Set();
        rule.tasks.forEach(other => {
          if (task !== other) graph[task].add(other);
        });
      });
    });
  
    const visited = new Set<string>();
    const stack = new Set<string>();
    const cycles: string[][] = [];
  
    const dfs = (node: string, path: string[]) => {
      if (stack.has(node)) {
        const cycleStartIndex = path.indexOf(node);
        cycles.push(path.slice(cycleStartIndex));
        return;
      }
      if (visited.has(node)) return;
  
      visited.add(node);
      stack.add(node);
      path.push(node);
  
      graph[node]?.forEach(neighbor => dfs(neighbor, path));
  
      stack.delete(node);
      path.pop();
    };
  
    Object.keys(graph).forEach(node => {
      if (!visited.has(node)) dfs(node, []);
    });
  
    return cycles;
  }
  