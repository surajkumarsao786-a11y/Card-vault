import React, { useState } from 'react';
import { useStore } from '../store';
import { Trash2, RefreshCcw, Image as ImageIcon, FileText, AlignLeft } from 'lucide-react';
import { cn } from '../utils';
import ConfirmModal from '../components/ConfirmModal';

export default function RecycleBin() {
  const { cards, promptProjects, deletedHeaderBlocks, updateCard, updatePromptProject, deleteCard, deletePromptProject, updateDeletedHeaderBlocks } = useStore();
  const [activeTab, setActiveTab] = useState<'cards' | 'prompts' | 'blocks'>('cards');
  const [blockSubTab, setBlockSubTab] = useState<'card' | 'prompt'>('card');
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'card' | 'prompt' | 'block' } | null>(null);

  const deletedCards = cards.filter(c => c.deletedAt);
  const deletedPrompts = promptProjects.filter(p => p.deletedAt);
  const deletedCardBlocks = deletedHeaderBlocks.filter(b => b.sourceType === 'card');
  const deletedPromptBlocks = deletedHeaderBlocks.filter(b => b.sourceType === 'prompt');

  const getDaysRemaining = (deletedAt: number) => {
    const daysPassed = Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - daysPassed);
  };

  const handleRestoreCard = async (id: string) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      await updateCard({ ...card, deletedAt: undefined });
    }
  };

  const handleRestorePrompt = async (id: string) => {
    const project = promptProjects.find(p => p.id === id);
    if (project) {
      await updatePromptProject({ ...project, deletedAt: undefined });
    }
  };

  const handleRestoreBlock = async (id: string) => {
    const block = deletedHeaderBlocks.find(b => b.id === id);
    if (!block) return;

    if (block.sourceType === 'card') {
      const card = cards.find(c => c.id === block.sourceId);
      if (card) {
        const { deletedAt, sourceId, sourceType, ...restBlock } = block;
        await updateCard({
          ...card,
          deletedAt: undefined, // CRITICAL BUG FIX: Nested Recovery - Restore parent card
          headerBlocks: [...(card.headerBlocks || []), restBlock]
        });
      }
    } else {
      const project = promptProjects.find(p => p.id === block.sourceId);
      if (project) {
        const { deletedAt, sourceId, sourceType, ...restBlock } = block;
        await updatePromptProject({
          ...project,
          deletedAt: undefined, // CRITICAL BUG FIX: Nested Recovery - Restore parent prompt
          blocks: [...(project.blocks || []), restBlock]
        });
      }
    }
    await updateDeletedHeaderBlocks(deletedHeaderBlocks.filter(b => b.id !== id));
  };

  const handleHardDelete = async () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'card') {
      await deleteCard(itemToDelete.id);
    } else if (itemToDelete.type === 'prompt') {
      await deletePromptProject(itemToDelete.id);
    } else if (itemToDelete.type === 'block') {
      await updateDeletedHeaderBlocks(deletedHeaderBlocks.filter(b => b.id !== itemToDelete.id));
    }
    
    setItemToDelete(null);
  };

  const handleEmptyBin = async () => {
    if (activeTab === 'cards') {
      for (const card of deletedCards) {
        await deleteCard(card.id);
      }
    } else if (activeTab === 'prompts') {
      for (const prompt of deletedPrompts) {
        await deletePromptProject(prompt.id);
      }
    } else if (activeTab === 'blocks') {
      const remainingBlocks = deletedHeaderBlocks.filter(b => b.sourceType !== blockSubTab);
      await updateDeletedHeaderBlocks(remainingBlocks);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between shrink-0 border-b border-border-main">
        <h2 className="text-2xl font-bold">Recycle Bin</h2>
        
        <div className="flex bg-bg-surface rounded-xl p-1 border border-border-main">
          <button
            onClick={() => setActiveTab('cards')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === 'cards' ? "bg-bg-surface-hover text-text-main" : "text-text-muted hover:text-text-main"
            )}
          >
            <FileText className="w-4 h-4" />
            Cards
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === 'prompts' ? "bg-bg-surface-hover text-text-main" : "text-text-muted hover:text-text-main"
            )}
          >
            <ImageIcon className="w-4 h-4" />
            Prompts
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === 'blocks' ? "bg-bg-surface-hover text-text-main" : "text-text-muted hover:text-text-main"
            )}
          >
            <AlignLeft className="w-4 h-4" />
            Blocks
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'cards' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-text-muted">Items are kept for 90 days before permanent deletion.</p>
              {deletedCards.length > 0 && (
                <button 
                  onClick={handleEmptyBin}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Empty Cards Bin
                </button>
              )}
            </div>
            
            {deletedCards.length === 0 ? (
              <div className="text-center text-text-muted mt-20">
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No deleted cards.</p>
              </div>
            ) : (
              deletedCards.map(card => (
                <div key={card.id} className="bg-bg-surface border border-border-main rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {card.images.length > 0 ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img src={card.images[0]} alt={card.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-bg-surface-hover flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-text-muted" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-text-main">{card.name}</h4>
                      <p className="text-xs text-text-muted mt-1">
                        {getDaysRemaining(card.deletedAt!)} days remaining
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRestoreCard(card.id)}
                      className="p-2 text-text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Restore"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setItemToDelete({ id: card.id, type: 'card' })}
                      className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-text-muted">Items are kept for 90 days before permanent deletion.</p>
              {deletedPrompts.length > 0 && (
                <button 
                  onClick={handleEmptyBin}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Empty Prompts Bin
                </button>
              )}
            </div>
            
            {deletedPrompts.length === 0 ? (
              <div className="text-center text-text-muted mt-20">
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No deleted prompt projects.</p>
              </div>
            ) : (
              deletedPrompts.map(project => (
                <div key={project.id} className="bg-bg-surface border border-border-main rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-bg-surface-hover flex items-center justify-center shrink-0">
                      <ImageIcon className={cn("w-6 h-6", project.color || "text-text-muted")} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-main">{project.name}</h4>
                      <p className="text-xs text-text-muted mt-1">
                        {getDaysRemaining(project.deletedAt!)} days remaining
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRestorePrompt(project.id)}
                      className="p-2 text-text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Restore"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setItemToDelete({ id: project.id, type: 'prompt' })}
                      className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'blocks' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <div className="flex bg-bg-surface rounded-xl p-1 border border-border-main">
                <button
                  onClick={() => setBlockSubTab('card')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    blockSubTab === 'card' ? "bg-bg-surface-hover text-text-main" : "text-text-muted hover:text-text-main"
                  )}
                >
                  Entry Page
                </button>
                <button
                  onClick={() => setBlockSubTab('prompt')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    blockSubTab === 'prompt' ? "bg-bg-surface-hover text-text-main" : "text-text-muted hover:text-text-main"
                  )}
                >
                  Prompt Gallery
                </button>
              </div>
              
              {(blockSubTab === 'card' ? deletedCardBlocks : deletedPromptBlocks).length > 0 && (
                <button 
                  onClick={handleEmptyBin}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Empty Blocks Bin
                </button>
              )}
            </div>
            
            {(blockSubTab === 'card' ? deletedCardBlocks : deletedPromptBlocks).length === 0 ? (
              <div className="text-center text-text-muted mt-20">
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No deleted header blocks.</p>
              </div>
            ) : (
              (blockSubTab === 'card' ? deletedCardBlocks : deletedPromptBlocks).map(block => {
                const sourceName = block.sourceType === 'card' 
                  ? cards.find(c => c.id === block.sourceId)?.name || 'Unknown Card'
                  : promptProjects.find(p => p.id === block.sourceId)?.name || 'Unknown Prompt';
                  
                return (
                  <div key={block.id} className="bg-bg-surface border border-border-main rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-bg-surface-hover flex items-center justify-center shrink-0">
                        <AlignLeft className="w-5 h-5 text-text-muted" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-main">{block.title || 'Untitled Block'}</h4>
                        <p className="text-xs text-text-muted mt-1">
                          From: {sourceName} • {getDaysRemaining(block.deletedAt!)} days remaining
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleRestoreBlock(block.id)}
                        className="p-2 text-text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Restore"
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setItemToDelete({ id: block.id, type: 'block' })}
                        className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Permanently"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmText="Delete Permanently"
        onConfirm={handleHardDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
