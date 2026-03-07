import React, { useState } from 'react';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { generateId, cn } from '../utils';
import ConfirmModal from '../components/ConfirmModal';

const PROJECT_COLORS = [
  'text-zinc-400', 'text-blue-400', 'text-yellow-400', 'text-green-400', 
  'text-purple-400', 'text-pink-400', 'text-orange-400', 'text-teal-400',
  'text-red-400', 'text-indigo-400', 'text-cyan-400', 'text-emerald-400'
];

export default function ProjectFiles() {
  const { projects, cards, tags, addProject, deleteProject } = useStore();
  const navigate = useNavigate();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(PROJECT_COLORS[0]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const newProject = {
      id: generateId(),
      name: newGroupName,
      cardIds: [],
      createdAt: Date.now(),
      color: newGroupColor,
    };
    await addProject(newProject);
    setNewGroupName('');
    setNewGroupColor(PROJECT_COLORS[0]);
    setShowCreateGroup(false);
  };

  const handleDeleteProject = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const getProjectTags = (cardIds: string[]) => {
    const projectCards = cards.filter(c => cardIds.includes(c.id));
    const tagCounts = new Map<string, number>();
    
    projectCards.forEach(card => {
      card.tags.forEach(tagId => {
        tagCounts.set(tagId, (tagCounts.get(tagId) || 0) + 1);
      });
    });

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tagId]) => tags.find(t => t.id === tagId))
      .filter(Boolean);

    return sortedTags;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 pb-24 relative">
      <h2 className="text-2xl font-bold mb-6 px-2">Project Files</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {projects.map(project => {
          const projectTags = getProjectTags(project.cardIds);
          
          return (
            <div 
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 hover:shadow-xl transition-all aspect-square relative group"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToDelete(project.id);
                }}
                className="absolute top-3 right-3 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Folder className={cn("w-12 h-12 transition-colors", project.color || "text-zinc-400 group-hover:text-zinc-300")} />
              
              <div className="text-center w-full">
                <span className="font-semibold text-zinc-100 line-clamp-1">{project.name}</span>
                <span className="text-xs text-zinc-500 mt-1 block">{project.cardIds.length} cards</span>
              </div>

              {projectTags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {projectTags.map((tag, i) => tag && (
                    <div key={i} className={cn("w-2.5 h-2.5 rounded-full", tag.color)} title={tag.name} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-zinc-500 mt-20">
          <p>No projects created yet.</p>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowCreateGroup(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-100 text-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10"
      >
        <Plus className="w-8 h-8" />
      </button>

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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 mb-4"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
            />
            
            <div className="mb-6">
              <label className="text-sm text-zinc-400 mb-2 block">Icon Color</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewGroupColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      newGroupColor === color ? "bg-zinc-800 ring-2 ring-zinc-600" : "hover:bg-zinc-800/50"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full bg-current", color)} />
                  </button>
                ))}
              </div>
            </div>

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

      <ConfirmModal 
        isOpen={!!projectToDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? The cards inside will not be deleted."
        confirmText="Delete"
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
