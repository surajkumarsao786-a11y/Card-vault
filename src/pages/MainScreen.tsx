import React, { useState, useMemo } from 'react';
import { Search, Plus, X, FolderPlus, SlidersHorizontal, Folder, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import CardItem from '../components/CardItem';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

export default function MainScreen() {
  const { cards, projects, addProject, updateProject } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [showGroupSelect, setShowGroupSelect] = useState(false);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedSearchTags, setSelectedSearchTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'nameAsc' | 'nameDesc'>('dateDesc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { tags, deleteCard } = useStore();

  const filteredCards = useMemo(() => {
    let result = cards.filter(card => {
      const searchLower = searchQuery.toLowerCase();
      const matchesText = card.name.toLowerCase().includes(searchLower) ||
                          card.summary.toLowerCase().includes(searchLower) ||
                          card.headerBlocks.some(b => b.title.toLowerCase().includes(searchLower) || b.content.toLowerCase().includes(searchLower));
      
      const matchesTags = selectedSearchTags.size === 0 || 
                          Array.from(selectedSearchTags).every(tagId => card.tags.includes(tagId));
                          
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && card.createdAt >= new Date(startDate).getTime();
      }
      if (endDate) {
        // Add 1 day to end date to include the whole day
        matchesDate = matchesDate && card.createdAt <= new Date(endDate).getTime() + 86400000;
      }
      
      return matchesText && matchesTags && matchesDate;
    });

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortBy) {
        case 'dateDesc': return b.createdAt - a.createdAt;
        case 'dateAsc': return a.createdAt - b.createdAt;
        case 'nameAsc': return a.name.localeCompare(b.name);
        case 'nameDesc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

    return result;
  }, [cards, searchQuery, selectedSearchTags, sortBy, startDate, endDate]);

  const handleLongPress = (id: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedCards(new Set([id]));
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(id)) {
      newSelection.delete(id);
      if (newSelection.size === 0) setSelectionMode(false);
    } else {
      newSelection.add(id);
    }
    setSelectedCards(newSelection);
  };

  const handleAddToGroup = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newCardIds = Array.from(new Set([...project.cardIds, ...Array.from(selectedCards)]));
      await updateProject({ ...project, cardIds: newCardIds });
    }
    setSelectionMode(false);
    setSelectedCards(new Set());
    setShowGroupSelect(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 flex items-center gap-3 shrink-0">
        <AnimatePresence mode="wait">
          {selectionMode ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex items-center justify-between bg-zinc-900 rounded-xl p-2 border border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectionMode(false); setSelectedCards(new Set()); }} className="p-2 hover:bg-zinc-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
                <span className="font-medium">{selectedCards.size} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowGroupSelect(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-lg font-medium hover:bg-white"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add to Group</span>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex-1 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
              </div>
              <button 
                onClick={() => setShowAdvancedSearch(true)}
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5 text-zinc-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Masonry Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="columns-2 gap-4 space-y-4">
          {filteredCards.map(card => (
            <CardItem 
              key={card.id} 
              card={card} 
              selected={selectionMode ? selectedCards.has(card.id) : undefined}
              onSelect={selectionMode ? () => toggleSelection(card.id) : undefined}
              onLongPress={() => handleLongPress(card.id)}
              onClick={() => navigate(`/entry/${card.id}`)}
            />
          ))}
        </div>
        {filteredCards.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 mt-20">
            <p>No cards found.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/entry')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-100 text-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Group Select Modal */}
      {showGroupSelect && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm border border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Group</h3>
              <button onClick={() => setShowGroupSelect(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No groups available. Create one from the menu.</p>
              ) : (
                projects.map(project => (
                  <button 
                    key={project.id}
                    onClick={() => handleAddToGroup(project.id)}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-3"
                  >
                    <Folder className="w-5 h-5 text-zinc-400" />
                    <span>{project.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md border border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Advanced Search</h3>
              <button onClick={() => setShowAdvancedSearch(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Sort By</h4>
                <select 
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                >
                  <option value="dateDesc">Newest First</option>
                  <option value="dateAsc">Oldest First</option>
                  <option value="nameAsc">Name (A-Z)</option>
                  <option value="nameDesc">Name (Z-A)</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Date Range</h4>
                <div className="flex gap-2">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 text-sm"
                  />
                  <input 
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Filter by Tags</h4>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2">
                  {tags.map(tag => {
                    const isSelected = selectedSearchTags.has(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const newTags = new Set(selectedSearchTags);
                          if (isSelected) newTags.delete(tag.id);
                          else newTags.add(tag.id);
                          setSelectedSearchTags(newTags);
                        }}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all border ${
                          isSelected 
                            ? `${tag.color} text-white border-transparent` 
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setSelectedSearchTags(new Set());
                  setStartDate('');
                  setEndDate('');
                  setSortBy('dateDesc');
                }}
                className="px-4 py-2 rounded-xl font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => setShowAdvancedSearch(false)}
                className="px-4 py-2 rounded-xl font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        title="Delete Cards"
        message={`Are you sure you want to delete ${selectedCards.size} selected card(s)? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={async () => {
          for (const id of Array.from(selectedCards)) {
            await deleteCard(id);
          }
          setSelectionMode(false);
          setSelectedCards(new Set());
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
