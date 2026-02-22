// import { loadPyodide } from 'pyodide';

let pyodide: any = null;

export async function initPyodide(log?: (msg: string) => void) {
  if (!pyodide) {
    if (log) log("Loading Pyodide runtime...");
    // @ts-ignore
    if (!window.loadPyodide) {
      throw new Error("Pyodide script not loaded. Please refresh the page.");
    }
    
    // @ts-ignore
    pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
    
    if (log) log("Pyodide runtime loaded.");
    if (log) log("Loading micropip package manager...");
    await pyodide.loadPackage("micropip");
    if (log) log("Micropip loaded.");
  }
  return pyodide;
}

export async function installPackages(packages: string[], log?: (msg: string) => void) {
  if (packages.length === 0) return;
  
  const py = await initPyodide(log);
  const micropip = py.pyimport("micropip");
  
  if (log) log(`Installing packages: ${packages.join(', ')}...`);
  
  try {
    await micropip.install(packages);
    if (log) log("Packages installed successfully.");
  } catch (e: any) {
    if (log) log(`Warning: Failed to install some packages: ${e.message}`);
    console.warn("Failed to install packages:", e);
    // Don't throw, let the code try to run anyway (maybe it doesn't strictly need them or they are built-in)
  }
}

export async function runPython(code: string, onOutput: (text: string) => void) {
  const py = await initPyodide((msg) => onOutput(msg + '\n'));
  
  // Reset stdout/stderr buffers
  py.setStdout({ batched: (msg: string) => onOutput(msg) });
  py.setStderr({ batched: (msg: string) => onOutput(msg) });

  try {
    // We wrap the code in a way that captures the last expression if it's not a print
    // But for general scripts, runPythonAsync is fine.
    await py.runPythonAsync(code);
  } catch (error: any) {
    onOutput(`\nTraceback (most recent call last):\n${error.message}\n`);
    throw error;
  }
}

export function extractImports(code: string): string[] {
  const imports: string[] = [];
  const lines = code.split('\n');
  for (const line of lines) {
    // Handle 'import x' and 'from x import y'
    const importMatch = line.match(/^import\s+([\w, ]+)/);
    const fromMatch = line.match(/^from\s+(\w+)/);
    
    if (importMatch) {
      const modules = importMatch[1].split(',').map(s => s.trim());
      modules.forEach(m => imports.push(m.split('.')[0]));
    }
    
    if (fromMatch) {
      imports.push(fromMatch[1].split('.')[0]);
    }
  }
  
  // Filter standard library
  const stdlib = [
    'sys', 'os', 'math', 'json', 'time', 'random', 're', 'datetime', 
    'collections', 'itertools', 'functools', 'typing', 'string', 'io', 'contextlib'
  ];
  
  return [...new Set(imports)].filter(pkg => !stdlib.includes(pkg));
}
