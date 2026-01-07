import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, CheckCircle, Zap, Cpu } from 'lucide-react';
import { DashboardStats, Workflow } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  recentWorkflows: Workflow[];
  onSelectWorkflow: (id: string) => void;
}

// Mock Data for Charts
const executionData = [
  { name: 'Mon', success: 400, fail: 24 },
  { name: 'Tue', success: 300, fail: 13 },
  { name: 'Wed', success: 550, fail: 40 },
  { name: 'Thu', success: 480, fail: 20 },
  { name: 'Fri', success: 390, fail: 15 },
  { name: 'Sat', success: 200, fail: 5 },
  { name: 'Sun', success: 150, fail: 8 },
];

const resourceData = [
  { name: '00:00', cpu: 12 },
  { name: '04:00', cpu: 15 },
  { name: '08:00', cpu: 45 },
  { name: '12:00', cpu: 60 },
  { name: '16:00', cpu: 55 },
  { name: '20:00', cpu: 30 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<any>; color: string }> = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
  <div className="bg-lumina-card p-6 rounded-2xl border border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-400 text-sm font-medium">{title}</span>
      <div className={`p-2 rounded-lg bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, recentWorkflows, onSelectWorkflow }) => {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-slate-400">System performance and workflow metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Executions" value={stats.totalExecutions.toLocaleString()} icon={Activity} color="text-blue-500" />
        <StatCard title="Active Workflows" value={stats.activeWorkflows.toString()} icon={Zap} color="text-amber-500" />
        <StatCard title="Success Rate" value={`${stats.successRate}%`} icon={CheckCircle} color="text-green-500" />
        <StatCard title="AI Tokens Used" value={stats.tokensUsed.toLocaleString()} icon={Cpu} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-lumina-card p-6 rounded-2xl border border-slate-800 h-[350px]">
          <h3 className="text-lg font-semibold text-white mb-6">Execution Volume</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={executionData}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-lumina-card p-6 rounded-2xl border border-slate-800 h-[350px]">
          <h3 className="text-lg font-semibold text-white mb-6">Resource Usage</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#334155', opacity: 0.2 }}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="cpu" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Workflows</h3>
        <div className="bg-lumina-card border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 text-slate-400 font-medium text-sm">Name</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Nodes</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Last Run</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No workflows created yet. Use the Assistant or Editor to create one.
                  </td>
                </tr>
              ) : (
                recentWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-white">{workflow.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {workflow.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{workflow.nodes.length} nodes</td>
                    <td className="p-4 text-slate-400">{workflow.lastRun || 'Never'}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => onSelectWorkflow(workflow.id)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;