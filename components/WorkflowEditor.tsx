import React, { useState } from 'react';
import { Play, Save, Plus, MousePointer2, AlertCircle } from 'lucide-react';
import { Workflow, WorkflowNode } from '../types';
import { analyzeWorkflow } from '../services/geminiService';

interface WorkflowEditorProps {
  workflow: Workflow | null;
  onSave: (workflow: Workflow) => void;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({ workflow, onSave }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!workflow) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <MousePointer2 size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-medium mb-2">No Workflow Selected</h2>
        <p>Select a workflow from the dashboard or create one with the Assistant.</p>
      </div>
    );
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    const result = await analyzeWorkflow(workflow);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="h-full flex flex-col relative bg-slate-950">
      {/* Toolbar */}
      <div className="h-16 border-b border-slate-800 bg-lumina-card px-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{workflow.name}</h2>
          <p className="text-xs text-slate-500">{workflow.nodes.length} nodes • {workflow.active ? 'Active' : 'Inactive'}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-900/30 text-indigo-300 rounded-lg hover:bg-indigo-900/50 transition-colors border border-indigo-500/30 text-sm"
          >
            {isAnalyzing ? "Analyzing..." : "AI Audit"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm">
            <Plus size={16} />
            Add Node
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-900/20">
            <Play size={16} />
            Execute
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto relative p-8">
        <div className="min-w-[1000px] min-h-[600px] relative">
            {/* Draw Connections */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                {workflow.connections.map(conn => {
                    const sourceNode = workflow.nodes.find(n => n.id === conn.source);
                    const targetNode = workflow.nodes.find(n => n.id === conn.target);
                    if (!sourceNode || !targetNode) return null;

                    // Simple Bezier calculation
                    const sx = sourceNode.position.x + 180; // Right side of source
                    const sy = sourceNode.position.y + 40;  // Center height
                    const tx = targetNode.position.x;       // Left side of target
                    const ty = targetNode.position.y + 40;  // Center height

                    return (
                        <path
                            key={conn.id}
                            d={`M ${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`}
                            stroke="#475569"
                            strokeWidth="2"
                            fill="none"
                        />
                    );
                })}
            </svg>

            {/* Draw Nodes */}
            {workflow.nodes.map((node) => (
                <div
                    key={node.id}
                    className="absolute w-[180px] bg-lumina-card border border-slate-700 rounded-xl shadow-xl p-3 flex flex-col gap-2 cursor-pointer hover:border-indigo-500 transition-colors z-10"
                    style={{ left: node.position.x, top: node.position.y }}
                >
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                             node.type === 'trigger' ? 'bg-green-500/20 text-green-400' :
                             node.type === 'action' ? 'bg-blue-500/20 text-blue-400' :
                             'bg-purple-500/20 text-purple-400'
                         }`}>
                             {/* Placeholder for dynamic icon logic */}
                             <div className="text-xs font-bold uppercase">{node.type[0]}</div>
                         </div>
                         <div className="overflow-hidden">
                             <div className="text-sm font-medium text-white truncate">{node.name}</div>
                             <div className="text-[10px] text-slate-500 uppercase">{node.type}</div>
                         </div>
                    </div>
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                        {Object.keys(node.data).length > 0 ? "Configured" : "No configuration"}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Analysis Panel Overlay */}
      {analysis && (
          <div className="absolute bottom-8 right-8 w-96 bg-lumina-card border border-slate-700 rounded-xl shadow-2xl p-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                  <AlertCircle size={20} />
                  <h3 className="font-bold">AI Analysis</h3>
              </div>
              <div className="text-sm text-slate-300 prose prose-invert">
                 <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} />
              </div>
              <button 
                onClick={() => setAnalysis(null)}
                className="mt-4 text-xs text-slate-500 hover:text-white underline"
              >
                  Dismiss
              </button>
          </div>
      )}
    </div>
  );
};

export default WorkflowEditor;