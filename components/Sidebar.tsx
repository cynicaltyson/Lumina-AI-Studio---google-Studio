import React from 'react';
import { LayoutDashboard, GitGraph, Bot, Settings, Zap } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workflow-editor', label: 'Workflow Editor', icon: GitGraph },
    { id: 'assistant', label: 'Lumina Assistant', icon: Bot },
  ];

  return (
    <div className="w-64 bg-lumina-card border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Lumina
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;