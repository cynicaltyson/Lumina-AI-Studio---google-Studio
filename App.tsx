import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkflowEditor from './components/WorkflowEditor';
import Assistant from './components/Assistant';
import { ViewState, Workflow, DashboardStats } from './types';

// Mock initial data
const INITIAL_STATS: DashboardStats = {
  totalExecutions: 12450,
  activeWorkflows: 8,
  successRate: 99.2,
  tokensUsed: 45000
};

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: '1',
    name: 'Daily Email Digest',
    description: 'Scrapes news and sends summary',
    active: true,
    lastRun: '2 mins ago',
    nodes: [
        { id: '1', name: 'Schedule Trigger', type: 'trigger', position: { x: 50, y: 100 }, data: {}, icon: 'clock' },
        { id: '2', name: 'HTTP Request', type: 'action', position: { x: 300, y: 100 }, data: {}, icon: 'globe' },
        { id: '3', name: 'Send Email', type: 'action', position: { x: 550, y: 100 }, data: {}, icon: 'mail' },
    ],
    connections: [
        { id: 'c1', source: '1', target: '2' },
        { id: 'c2', source: '2', target: '3' }
    ]
  },
  {
    id: '2',
    name: 'Lead Sync CRM',
    description: 'Syncs new webhook leads to CRM',
    active: false,
    lastRun: '1 day ago',
    nodes: [
        { id: '1', name: 'Webhook', type: 'webhook', position: { x: 50, y: 150 }, data: {}, icon: 'webhook' },
        { id: '2', name: 'Transform Data', type: 'function', position: { x: 300, y: 150 }, data: {}, icon: 'code' },
    ],
    connections: [
        { id: 'c1', source: '1', target: '2' }
    ]
  }
];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  const handleWorkflowGenerated = (workflow: Workflow) => {
    setWorkflows(prev => [workflow, ...prev]);
    setActiveWorkflowId(workflow.id);
  };

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || null;

  const handleSelectWorkflow = (id: string) => {
    setActiveWorkflowId(id);
    setCurrentView('workflow-editor');
  };

  return (
    <div className="flex h-screen bg-lumina-dark text-lumina-text font-sans overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 h-full overflow-hidden bg-slate-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />
        
        {currentView === 'dashboard' && (
          <Dashboard 
            stats={INITIAL_STATS} 
            recentWorkflows={workflows} 
            onSelectWorkflow={handleSelectWorkflow}
          />
        )}

        {currentView === 'workflow-editor' && (
          <WorkflowEditor 
            workflow={activeWorkflow} 
            onSave={() => {}} 
          />
        )}

        {currentView === 'assistant' && (
          <Assistant 
            onWorkflowGenerated={handleWorkflowGenerated}
          />
        )}
      </main>
    </div>
  );
}

export default App;