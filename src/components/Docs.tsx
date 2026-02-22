import React from 'react';
import { BookOpen, Code, Cpu, Globe, Key, Layers, MessageSquare, Shield, Sparkles, Terminal, Zap } from 'lucide-react';

export default function Docs() {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a] text-gray-300">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-pink-500" />
            ForeverMore.Ai Documentation
          </h1>
          <p className="text-lg text-gray-400">
            The complete guide to using, configuring, and building with ForeverMore.Ai.
          </p>
        </div>

        {/* Section 1: What it does */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Sparkles className="w-6 h-6 text-violet-400" />
            What It Does
          </h2>
          <p className="leading-relaxed">
            ForeverMore.Ai is a powerful, code-centric chat interface designed for developers and creators. It acts as your intelligent pair programmer, capable of not just answering questions, but actively writing, editing, and managing code files within a virtual workspace.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Intelligent Chat:</strong> Converse with advanced AI models (like Mistral) for coding help, brainstorming, and general inquiries.</li>
            <li><strong>Virtual File System:</strong> The AI can create, read, and update files in real-time. You can view these files in the File Manager.</li>
            <li><strong>Live Web Preview:</strong> Build React applications directly in the chat and preview them instantly in the Web Preview tab.</li>
            <li><strong>Community Models:</strong> Discover and chat with custom AI personalities created by the community, or build your own.</li>
          </ul>
        </section>

        {/* Section 2: How it works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            How It Works
          </h2>
          <p className="leading-relaxed">
            Under the hood, ForeverMore.Ai uses a sophisticated prompt engineering and parsing system combined with a secure backend proxy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-pink-400"/> 1. Intent Parsing</h3>
              <p className="text-sm">When the AI generates code blocks or specific action tags (like <code>[RUN: command]</code>), our frontend parses these in real-time, extracting files and tasks.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Layers className="w-4 h-4 text-blue-400"/> 2. State Management</h3>
              <p className="text-sm">Extracted files are saved to a local SQLite database (with Supabase sync) and injected into the AI's context window for subsequent messages.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-400"/> 3. Secure Proxy</h3>
              <p className="text-sm">All AI requests are routed through our Node.js/Express backend (<code>/api/chat</code>). This hides the real API keys (like Mistral) from the browser.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-green-400"/> 4. Web Preview</h3>
              <p className="text-sm">In Web Build mode, generated React code is dynamically transpiled using Babel and rendered in a secure iframe.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Core Features
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">💬 Multi-Session Chat</h3>
              <p className="text-sm">Maintain multiple concurrent conversations. Each session has its own isolated context and file system.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">📂 File Manager</h3>
              <p className="text-sm">View, edit, and delete files generated by the AI. The AI automatically sees the current state of these files.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">🌐 Web Build Mode</h3>
              <p className="text-sm">Toggle "Web Build" mode to instruct the AI to generate single-file React applications (using Tailwind CSS). Switch to the Preview tab to see it live.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">🎭 Custom Models</h3>
              <p className="text-sm">Create your own AI personalities by defining a custom system prompt and selecting a base model. Deploy them instantly.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">☁️ Cloud Sync (Supabase)</h3>
              <p className="text-sm">If configured, all your chats, files, and custom models are seamlessly synced to a Supabase PostgreSQL database, with a local SQLite fallback.</p>
            </div>
          </div>
        </section>

        {/* Section 4: AI Integration & Tutorials */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Terminal className="w-6 h-6 text-red-400" />
            AI Integration & Tutorials
          </h2>
          
          <div className="space-y-8">
            <div className="bg-black/50 p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Key className="w-5 h-5 text-pink-500" />
                How to add AI to your own projects
              </h3>
              <p className="mb-4 text-sm">
                ForeverMore.Ai provides a built-in proxy endpoint so you can build AI apps without exposing your keys.
              </p>
              <div className="bg-[#0d0d0d] p-4 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto text-green-400">
{`// Example: Calling the AI from a generated React component
const fetchAIResponse = async (userText) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userText }],
      model: 'fm-main-v1.0.1'
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
};`}
              </div>
              <p className="mt-4 text-sm text-yellow-400/80">
                <strong>Important:</strong> Always use the relative path <code>/api/chat</code>. Do not use absolute URLs to avoid CORS issues. Do not generate <code>.env</code> files with real API keys.
              </p>
            </div>

            <div className="bg-black/50 p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                Tutorial: Building a Weather App
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>Toggle <strong>Web Build</strong> mode in the top navigation.</li>
                <li>Type: <em>"Build a beautiful weather dashboard using the OpenMeteo API. Make it dark mode with Tailwind."</em></li>
                <li>Wait for the AI to generate the code. You will see a "Live Execution" popup tracking the file creation.</li>
                <li>Once complete, click the <strong>Preview</strong> tab to see your fully functional React application.</li>
                <li>If you want changes, go back to Chat and say: <em>"Make the temperature font larger and add a 5-day forecast."</em></li>
              </ol>
            </div>

            <div className="bg-black/50 p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                GitHub Integration
              </h3>
              <p className="mb-4 text-sm">
                You can export your generated projects directly to GitHub.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <strong>Settings</strong> (gear icon in the top right).</li>
                <li>Expand <strong>Advanced Connection Settings</strong>.</li>
                <li>Enter your GitHub Personal Access Token (PAT) with <code>repo</code> permissions.</li>
                <li>Click the GitHub icon next to the input to verify.</li>
                <li>Click <strong>Upload Project to GitHub</strong> to push all files in the current session to a new repository.</li>
              </ol>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
