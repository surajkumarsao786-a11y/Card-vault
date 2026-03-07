import React, { useState } from 'react';
import { Menu, X, Home, Folder, Plus, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { generateId } from '../utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const { projects, addProject } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const newProject = {
      id: generateId(),
      name: newGroupName,
      cardIds: [],
      createdAt: Date.now(),
    };
    await addProject(newProject);
    setNewGroupName('');
    setShowCreateGroup(false);
    navigate(`/projects`);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="h-14 flex items-center px-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-semibold text-lg tracking-tight">Roleplay Vault</h1>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-zinc-900 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r border-zinc-800`}>
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-1">
            <button 
              onClick={() => { navigate('/'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${location.pathname === '/' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Main Screen</span>
            </button>
            <button 
              onClick={() => { navigate('/stats'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${location.pathname === '/stats' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Statistics</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Groups</h3>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
                title="Create Group"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {projects.length > 0 && (
              <button 
                onClick={() => { navigate('/projects'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${location.pathname.startsWith('/project') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
              >
                <Folder className="w-5 h-5" />
                <span className="font-medium">Project Files</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Create Group</h3>
            <input 
              type="text" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateGroup(false)}
                className="px-4 py-2 rounded-xl font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup}
                className="px-4 py-2 rounded-xl font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
