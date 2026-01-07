import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Play } from 'lucide-react';
import { ChatMessage, Workflow } from '../types';
import { streamChatResponse, generateWorkflowFromPrompt } from '../services/geminiService';

interface AssistantProps {
  onWorkflowGenerated: (workflow: Workflow) => void;
}

const Assistant: React.FC<AssistantProps> = ({ onWorkflowGenerated }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello! I'm Lumina. I can help you design automation workflows, debug issues, or answer questions about n8n integrations. What are we building today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Check for intent to generate workflow
      const lowerInput = userMsg.content.toLowerCase();
      if (lowerInput.includes('create') && (lowerInput.includes('workflow') || lowerInput.includes('automation'))) {
        setIsGeneratingWorkflow(true);
        // Create a temporary "thinking" message
        setMessages(prev => [...prev, {
            id: 'thinking',
            role: 'model',
            content: "Analyzing your requirements and designing a workflow...",
            timestamp: new Date(),
            isStreaming: true
        }]);
        
        const workflow = await generateWorkflowFromPrompt(userMsg.content);
        
        if (workflow) {
          onWorkflowGenerated(workflow);
          setMessages(prev => prev.map(m => m.id === 'thinking' ? {
            ...m,
            content: `I've created a workflow for "${workflow.name}" based on your description. It has ${workflow.nodes.length} nodes. Check the Workflow Editor to customize it further.`,
            isStreaming: false
          } : m));
        } else {
           setMessages(prev => prev.map(m => m.id === 'thinking' ? {
            ...m,
            content: "I couldn't generate a valid workflow from that description. Could you provide more details?",
            isStreaming: false
          } : m));
        }
        setIsGeneratingWorkflow(false);
        setIsLoading(false);
        return;
      }

      // Standard Chat Stream
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const modelMsgId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      }]);

      await streamChatResponse(history, userMsg.content, (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, content: msg.content + chunk } 
            : msg
        ));
      });

      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-6 border-b border-slate-800 bg-lumina-card">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={24} />
          Lumina Assistant
        </h2>
        <p className="text-slate-400 text-sm mt-1">Powered by Gemini 3 Flash</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'model' ? 'bg-indigo-600' : 'bg-slate-700'
            }`}>
              {msg.role === 'model' ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
            </div>
            
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'model' 
                ? 'bg-lumina-card text-slate-200 border border-slate-700' 
                : 'bg-indigo-600 text-white'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content || (msg.isStreaming && <span className="animate-pulse">Thinking...</span>)}
              </div>
              {isGeneratingWorkflow && msg.isStreaming && msg.id === 'thinking' && (
                  <div className="mt-3 flex items-center gap-2 text-indigo-300 bg-indigo-900/30 p-2 rounded text-sm">
                      <Loader2 className="animate-spin" size={16} />
                      Generating workflow schema...
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-lumina-card border-t border-slate-800">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a workflow to build, or ask a question..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[80px]"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Pro tip: Try "Create a workflow to scrape a website and email me the summary"
        </p>
      </div>
    </div>
  );
};

export default Assistant;