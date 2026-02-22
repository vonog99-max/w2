import React, { useState, useRef } from 'react';
import { FileText, Wrench, Download, Copy, Trash2, X, Play, Terminal as TerminalIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/src/lib/utils';
import Terminal from './Terminal';
import { runPython, installPackages, extractImports } from '@/src/services/pyodide';
import { Terminal as XTerm } from 'xterm';

interface ProjectFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface FileManagerProps {
  files: ProjectFile[];
  onAutoFix: (file: ProjectFile, error?: string) => void;
  onDelete: (id: string) => void;
}

export default function FileManager({ files, onAutoFix, onDelete }: FileManagerProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(files[0]?.id || null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string>('');
  const termRef = useRef<XTerm | null>(null);

  const selectedFile = files.find(f => f.id === selectedFileId);

  const handleRun = async () => {
    if (!selectedFile || selectedFile.language !== 'python') return;
    
    setShowTerminal(true);
    setIsRunning(true);
    termRef.current?.clear();
    
    const log = (msg: string) => {
      // Replace ANSI color codes if needed, or just print
      termRef.current?.writeln(`\x1b[2m${msg}\x1b[0m`);
    };

    try {
      setStatus('Initializing...');
      
      const imports = extractImports(selectedFile.content);
      if (imports.length > 0) {
        await installPackages(imports, (msg) => {
           termRef.current?.writeln(`\x1b[36m${msg}\x1b[0m`);
        });
      }

      setStatus('Running...');
      termRef.current?.writeln('\x1b[32m>>> Running project...\x1b[0m');
      
      await runPython(selectedFile.content, (text) => {
        termRef.current?.write(text.replace(/\n/g, '\r\n'));
      });
      
      setStatus('Completed');
      termRef.current?.writeln('\n\x1b[32m>>> Execution completed.\x1b[0m');
    } catch (error: any) {
      setStatus('Error');
      // Error is already logged by runPython, but we can add a marker
      termRef.current?.writeln(`\n\x1b[31m>>> Execution failed.\x1b[0m`);
    } finally {
      setIsRunning(false);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>No files generated yet.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0a0a0a]">
      {/* File List */}
      <div className="w-64 border-r border-white/10 bg-[#050505] flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-gray-300">Project Files</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map(file => (
            <button
              key={file.id}
              onClick={() => { setSelectedFileId(file.id); setShowTerminal(false); }}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg text-sm text-left transition-colors group",
                selectedFileId === file.id 
                  ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <div 
                onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-300">{selectedFile.name}</span>
                <span className="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-white/5">{selectedFile.language}</span>
                {status && isRunning && (
                  <span className="text-xs text-yellow-500 animate-pulse ml-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    {status}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {selectedFile.language === 'python' && (
                  <button 
                    onClick={handleRun}
                    disabled={isRunning}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                      isRunning 
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 cursor-wait"
                        : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"
                    )}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                )}
                <button 
                  onClick={() => onAutoFix(selectedFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-lg text-xs font-medium transition-colors border border-pink-500/20"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Auto Fix
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(selectedFile.content)}
                  className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 relative">
              {showTerminal ? (
                <div className="absolute inset-0 z-10 bg-[#0a0a0a]">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-white/10">
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <TerminalIcon className="w-3.5 h-3.5" /> Terminal Output
                    </span>
                    <button 
                      onClick={() => setShowTerminal(false)}
                      className="text-gray-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 h-[calc(100%-33px)] p-2">
                    <Terminal onInit={(term) => { termRef.current = term; }} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                  {selectedFile.name === '.env' || selectedFile.content.includes('API_KEY') || selectedFile.content.includes('ENDPOINT') ? (
                    <div className="absolute inset-0 z-10 backdrop-blur-md flex items-center justify-center bg-black/50 text-white font-mono text-sm">
                      <div className="bg-black/80 p-4 rounded-xl border border-white/10 text-center">
                        <p className="mb-2 text-pink-400">Sensitive Content Hidden</p>
                        <p className="text-xs text-gray-400">Environment variables are blurred for security.</p>
                      </div>
                    </div>
                  ) : null}
                  <SyntaxHighlighter
                    language={selectedFile.language}
                    style={vscDarkPlus}
                    customStyle={{ 
                      margin: 0, 
                      padding: '1.5rem', 
                      background: 'transparent', 
                      fontSize: '14px', 
                      lineHeight: '1.5',
                      filter: (selectedFile.name === '.env' || selectedFile.content.includes('API_KEY')) ? 'blur(4px)' : 'none'
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                  >
                    {selectedFile.content}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a file to view content
          </div>
        )}
      </div>
    </div>
  );
}

