import React from 'react';
import { Plus, MessageSquare, Github, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Session {
  id: string;
  title: string;
  updatedAt: number;
}

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
}

export default function Sidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  isOpen 
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="w-64 bg-[#0d0d0d] border-r border-white/10 flex flex-col h-full shrink-0">
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-sm text-left transition-colors group relative",
              currentSessionId === session.id 
                ? "bg-white/10 text-white" 
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            )}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate pr-6">{session.title}</span>
            <div 
              onClick={(e) => onDeleteSession(session.id, e)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
