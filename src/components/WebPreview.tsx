import React, { useEffect, useState, useRef } from 'react';

interface ProjectFile {
  name: string;
  content: string;
}

interface WebPreviewProps {
  files: ProjectFile[];
  env?: Record<string, string>;
}

export default function WebPreview({ files, env = {} }: WebPreviewProps) {
  const [srcDoc, setSrcDoc] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!files || files.length === 0) return;

    // Find App.tsx or index.tsx or main.tsx
    const entryFile = files.find(f => f.name === 'App.tsx') || 
                      files.find(f => f.name === 'index.tsx') || 
                      files.find(f => f.name === 'main.tsx') ||
                      files[0];

    if (!entryFile) {
      setError('No entry file found (App.tsx, index.tsx, or main.tsx)');
      return;
    }

    // Prepare files for injection
    const filesMap = files.reduce((acc, file) => {
      acc[file.name] = file.content;
      // Also handle ./ prefix
      acc[`./${file.name}`] = file.content;
      // Handle without extension if it's .tsx or .ts or .js
      const nameNoExt = file.name.replace(/\.(tsx|ts|js|jsx)$/, '');
      acc[nameNoExt] = file.content;
      acc[`./${nameNoExt}`] = file.content;
      return acc;
    }, {} as Record<string, string>);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://unpkg.com/lucide-react@latest"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { background-color: #000; color: #fff; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    const { createRoot } = ReactDOM;
    
    // Support Lucide Icons
    const LucideIcons = window['lucide-react'] || {};
    
    // Inject Environment Variables
    const env = ${JSON.stringify(env)};
    window.process = { env };
    window.import = { meta: { env } }; // Mock import.meta.env for some setups
    
    // Files map
    const files = ${JSON.stringify(filesMap)};
    const entryFileName = "${entryFile.name}";

    // Module registry
    const modules = {};
    
    // Mock require function
    function require(name) {
      if (name === 'react') return React;
      if (name === 'react-dom') return ReactDOM;
      if (name === 'lucide-react') return LucideIcons;
      
      // Check if it's a local file
      if (files[name]) {
        if (modules[name]) return modules[name].exports;
        
        // Create module
        const module = { exports: {} };
        modules[name] = module;
        
        // Execute file
        try {
          const { code } = Babel.transform(files[name], { 
            presets: ['react', 'typescript', 'env'],
            filename: name + '.tsx'
          });
          
          // Execute with local scope
          new Function('require', 'module', 'exports', 'React', 'ReactDOM', code)(require, module, module.exports, React, ReactDOM);
          return module.exports;
        } catch (err) {
          console.error('Error executing ' + name, err);
          throw err;
        }
      }
      
      return window[name] || null;
    }

    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      render() {
        if (this.state.hasError) {
          return (
            <div className="p-6 text-red-400 bg-red-950/30 rounded-2xl border border-red-500/30 backdrop-blur-xl">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Runtime Error
              </h3>
              <div className="bg-black/40 p-4 rounded-xl font-mono text-xs overflow-auto border border-white/5">
                {this.state.error.toString()}
              </div>
            </div>
          );
        }
        return this.props.children;
      }
    }

    try {
      // Execute entry file
      const AppExports = require(entryFileName);
      const App = AppExports.default || AppExports;
      
      if (App) {
        const root = createRoot(document.getElementById('root'));
        root.render(<ErrorBoundary><App /></ErrorBoundary>);
      } else {
        throw new Error('No default export found in ' + entryFileName);
      }
    } catch (err) {
      document.getElementById('root').innerHTML = \`
        <div class="p-6 text-orange-400 bg-orange-950/20 rounded-2xl border border-orange-500/20 backdrop-blur-xl">
          <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Compilation Error
          </h3>
          <div class="bg-black/40 p-4 rounded-xl font-mono text-xs overflow-auto border border-white/5">
            \${err.message}
          </div>
        </div>
      \`;
    }
  </script>
</body>
</html>
    `;
    setSrcDoc(html);
  }, [files]);

  return (
    <div className="flex-1 h-full bg-[#111] border-l border-white/10 relative">
      <div className="absolute top-0 left-0 right-0 bg-[#111] border-b border-white/10 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
        <span>Preview Mode</span>
        <span className="text-[10px] opacity-50">React + Tailwind</span>
      </div>
      <iframe 
        srcDoc={srcDoc}
        className="w-full h-full border-0 pt-8"
        title="Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
