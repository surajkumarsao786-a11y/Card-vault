import React, { useState, useMemo, useEffect } from 'react';
import { Menu, X, Home, Folder, Plus, BarChart3, BookOpen, Trash2, ChevronRight, ArrowLeft, Sun, Moon, MoonStar } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useStore } from '../store';
import { generateId } from '../utils';
import { useSwipeable } from 'react-swipeable';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const { projects, cards, promptProjects, addProject, theme, setTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handlers = useSwipeable({
    onSwipedRight: (e) => {
      if (e.initial[0] <= 20) {
        setSidebarOpen(true);
      }
    },
    onSwipedLeft: () => setSidebarOpen(false),
    trackMouse: false,
    delta: 50,
  });

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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'amoled');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'amoled') {
      root.classList.add('amoled');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    
    if (path === '/') return [{ label: 'Main Screen', path: '/' }];
    if (path === '/stats') return [{ label: 'Statistics', path: '/stats' }];
    if (path === '/prompts') return [{ label: 'Prompt Gallery', path: '/prompts' }];
    if (path === '/projects') return [{ label: 'Card Gallery', path: '/projects' }];
    if (path === '/bin') return [{ label: 'Recycle Bin', path: '/bin' }];
    
    if (path.startsWith('/prompt/')) {
      const id = path.split('/')[2];
      const prompt = promptProjects.find(p => p.id === id);
      return [
        { label: 'Prompt Gallery', path: '/prompts' },
        { label: prompt?.name || 'New Prompt', path }
      ];
    }
    
    if (path.startsWith('/project/')) {
      const id = path.split('/')[2];
      const project = projects.find(p => p.id === id);
      return [
        { label: 'Card Gallery', path: '/projects' },
        { label: project?.name || 'Project', path }
      ];
    }
    
    if (path.startsWith('/entry/')) {
      const id = path.split('/')[2];
      const card = cards.find(c => c.id === id);
      return [
        { label: 'Main Screen', path: '/' },
        { label: card?.name || 'New Entry', path }
      ];
    }
    
    if (path === '/entry') {
      return [
        { label: 'Main Screen', path: '/' },
        { label: 'New Entry', path }
      ];
    }

    return [{ label: 'Roleplay Vault', path: '/' }];
  }, [location.pathname, projects, cards, promptProjects]);

  return (
    <div {...handlers} className="h-[100dvh] bg-bg-main text-text-main font-sans flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
      {/* Top Bar */}
      <header className="h-14 flex items-center px-4 border-b border-border-main bg-bg-main/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 hover:bg-bg-surface-hover rounded-lg transition-colors shrink-0">
          <Menu className="w-6 h-6" />
        </button>
        
        {breadcrumbs.length > 1 && (
          <button 
            onClick={() => navigate(breadcrumbs[breadcrumbs.length - 2].path)}
            className="p-2 hover:bg-bg-surface-hover rounded-lg transition-colors shrink-0 ml-1 md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="ml-2 md:ml-4 flex items-center overflow-hidden">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-text-muted mx-1.5 shrink-0" />}
              <Link 
                to={crumb.path}
                className={`truncate transition-colors ${
                  index === breadcrumbs.length - 1 
                    ? 'font-semibold text-lg tracking-tight text-text-main' 
                    : 'text-sm font-medium text-text-muted hover:text-text-secondary hidden md:block'
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-bg-surface z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r border-border-main pt-[var(--safe-top)] pb-[var(--safe-bottom)]`}>
        <div className="p-4 flex items-center justify-between border-b border-border-main shrink-0">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-bg-surface-hover rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-1">
            <button 
              onClick={() => { navigate('/'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${location.pathname === '/' ? 'bg-bg-surface-hover text-text-main' : 'text-text-muted hover:bg-bg-surface-hover/50 hover:text-text-secondary'}`}
            >
              {location.pathname === '/' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />}
              <Home className="w-5 h-5" />
              <span className="font-medium">Main Screen</span>
            </button>
            <button 
              onClick={() => { navigate('/stats'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${location.pathname === '/stats' ? 'bg-bg-surface-hover text-text-main' : 'text-text-muted hover:bg-bg-surface-hover/50 hover:text-text-secondary'}`}
            >
              {location.pathname === '/stats' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />}
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Statistics</span>
            </button>
            <button 
              onClick={() => { navigate('/prompts'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${location.pathname.startsWith('/prompt') ? 'bg-bg-surface-hover text-text-main' : 'text-text-muted hover:bg-bg-surface-hover/50 hover:text-text-secondary'}`}
            >
              {location.pathname.startsWith('/prompt') && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />}
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Prompt Gallery</span>
            </button>
            <button 
              onClick={() => { navigate('/bin'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${location.pathname === '/bin' ? 'bg-bg-surface-hover text-text-main' : 'text-text-muted hover:bg-bg-surface-hover/50 hover:text-text-secondary'}`}
            >
              {location.pathname === '/bin' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />}
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Recycle Bin</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Groups</h3>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="p-1 hover:bg-bg-surface-hover rounded-md text-text-muted hover:text-text-main transition-colors"
                title="Create Group"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {projects.length > 0 && (
              <button 
                onClick={() => { navigate('/projects'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${location.pathname.startsWith('/project') ? 'bg-bg-surface-hover text-text-main' : 'text-text-muted hover:bg-bg-surface-hover/50 hover:text-text-secondary'}`}
              >
                {location.pathname.startsWith('/project') && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />}
                <Folder className="w-5 h-5" />
                <span className="font-medium">Card Gallery</span>
              </button>
            )}
          </div>
        </div>

        {/* Theme Toggler */}
        <div className="p-4 border-t border-border-main shrink-0">
          <div className="bg-bg-main rounded-xl p-1 flex items-center border border-border-main">
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-bg-surface-hover text-text-main shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              title="Light Mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-bg-surface-hover text-text-main shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              title="Dark Mode"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme('amoled')}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-colors ${theme === 'amoled' ? 'bg-bg-surface-hover text-text-main shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              title="AMOLED Dark"
            >
              <MoonStar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-2xl p-6 w-full max-w-sm border border-border-main shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Create Group</h3>
            <input 
              type="text" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-accent mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateGroup(false)}
                className="px-4 py-2 rounded-xl font-medium text-text-muted hover:bg-bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup}
                className="px-4 py-2 rounded-xl font-medium bg-text-main text-bg-main hover:bg-text-secondary transition-colors"
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
