import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import CardItem from '../components/CardItem';
import { Plus, X, ArrowLeft, GripVertical, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, cards, updateProject } = useStore();
  
  const project = projects.find(p => p.id === id);
  // Maintain the order of cards based on project.cardIds, but sort pinned cards to top
  const projectCards = useMemo(() => {
    if (!project) return [];
    const _cards = project.cardIds.map(cardId => cards.find(c => c.id === cardId)).filter(Boolean) as typeof cards;
    return _cards.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0; // Maintain original order for others
    });
  }, [project, cards]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());

  if (!project) {
    return <div className="p-4 text-center text-zinc-500">Project not found</div>;
  }

  const availableCards = cards.filter(c => !project.cardIds.includes(c.id));

  const handleAddCards = async () => {
    const newCardIds = [...project.cardIds, ...Array.from(selectedToAdd)];
    await updateProject({ ...project, cardIds: newCardIds });
    setShowAddModal(false);
    setSelectedToAdd(new Set());
  };

  const toggleAddSelection = (cardId: string) => {
    const newSelection = new Set(selectedToAdd);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedToAdd(newSelection);
  };

  const handleRemoveCard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCardIds = project.cardIds.filter(id => id !== cardId);
    await updateProject({ ...project, cardIds: newCardIds });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(project.cardIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    await updateProject({ ...project, cardIds: items });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <div className="p-4 flex items-center gap-4 shrink-0 border-b border-zinc-800">
        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-zinc-800 rounded-lg -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">{project.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {projectCards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <p>This project is completely empty.</p>
            <p className="text-sm mt-2">Click the + button to add cards.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="project-cards">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="columns-2 sm:columns-3 gap-4 space-y-4"
                >
                  {projectCards.map((card, index) => (
                    // @ts-ignore - known issue with react 19 types
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative group break-inside-avoid ${snapshot.isDragging ? 'z-50' : ''}`}
                        >
                          <div className="absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div 
                              {...provided.dragHandleProps}
                              className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                          </div>
                          
                          <button 
                            onClick={(e) => handleRemoveCard(card.id, e)}
                            className="absolute right-2 top-2 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className={snapshot.isDragging ? 'opacity-90 scale-105 transition-transform' : ''}>
                            <CardItem 
                              card={card} 
                              onClick={() => navigate(`/entry/${card.id}`)}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-100 text-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add Cards Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-2xl border border-zinc-800 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-lg font-semibold">Add Cards to Project</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 pr-2">
              {availableCards.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">No available cards to add.</p>
              ) : (
                <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                  {availableCards.map(card => (
                    <CardItem 
                      key={card.id} 
                      card={card} 
                      selected={selectedToAdd.has(card.id)}
                      onClick={() => toggleAddSelection(card.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCards}
                disabled={selectedToAdd.size === 0}
                className="px-4 py-2 rounded-xl font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-zinc-100"
              >
                Add {selectedToAdd.size > 0 ? `(${selectedToAdd.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
