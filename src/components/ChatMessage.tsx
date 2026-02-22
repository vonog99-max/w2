import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Terminal, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatMessageProps {
  msg: Message;
  copyToClipboard: (text: string) => void;
  downloadCode: (code: string, lang: string) => void;
}

const ChatMessage = memo(({ msg, copyToClipboard, downloadCode }: ChatMessageProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 max-w-4xl mx-auto",
        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
        msg.role === 'user' 
          ? "bg-white/10 border-white/10" 
          : "bg-pink-500/10 border-pink-500/20"
      )}>
        {msg.role === 'user' ? <div className="w-3 h-3 bg-white rounded-full" /> : <Sparkles className="w-4 h-4 text-pink-400" />}
      </div>
      
      <div className={cn(
        "flex-1 min-w-0 rounded-3xl p-4 md:p-6",
        msg.role === 'user' 
          ? "bg-white/5 text-gray-100" 
          : "bg-white/5 text-gray-200 border border-white/5"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}: any) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              return !inline && match ? (
                <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#050505]">
                  <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
                    <span className="text-xs font-mono text-gray-500">{match[1]}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(codeString)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => downloadCode(codeString, match[1])}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, borderRadius: 0, background: 'transparent' }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-pink-500/10 px-1.5 py-0.5 rounded text-sm font-mono text-pink-400" {...props}>
                  {children}
                </code>
              );
            },
            p: ({children}) => <p className="mb-4 last:mb-0 leading-7">{children}</p>,
            ul: ({children}) => <ul className="list-disc pl-4 mb-4 space-y-1 marker:text-pink-500">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-4 mb-4 space-y-1 marker:text-pink-500">{children}</ol>,
            a: ({href, children}) => <a href={href} className="text-pink-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            blockquote: ({children}) => <blockquote className="border-l-2 border-pink-500/50 pl-4 italic text-gray-400 my-4">{children}</blockquote>,
          }}
        >
          {msg.content.split('--- ATTACHED FILES ---')[0]}
        </ReactMarkdown>
        
        {msg.content.includes('--- ATTACHED FILES ---') && (
           <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
                <Paperclip className="w-3 h-3" />
                Attached Files included in context
              </p>
           </div>
        )}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
