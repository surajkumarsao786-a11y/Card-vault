import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { BarChart3, Copy, FileText, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

export default function Statistics() {
  const { cards, promptProjects } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cards' | 'prompts'>('cards');

  const cardStats = useMemo(() => {
    const activeCards = cards.filter(c => !c.deletedAt);
    const allStats: any[] = [];

    activeCards.forEach(card => {
      // Process G1 (Default)
      (card.headerBlocks || []).forEach(block => {
        if (block.copyCount && block.copyCount > 0) {
          allStats.push({
            ...block,
            parentId: card.id,
            parentName: card.name,
            type: 'card',
            generationName: 'G1',
            variationName: 'V1',
            copyCount: block.copyCount
          });
        }
        if (block.variations) {
          block.variations.forEach(v => {
            if (v.copyCount && v.copyCount > 0) {
              allStats.push({
                ...block,
                parentId: card.id,
                parentName: card.name,
                type: 'card',
                generationName: 'G1',
                variationName: v.name,
                copyCount: v.copyCount
              });
            }
          });
        }
      });

      // Process other generations
      if (card.variations) {
        card.variations.forEach(gen => {
          (gen.headerBlocks || []).forEach(block => {
            if (block.copyCount && block.copyCount > 0) {
              allStats.push({
                ...block,
                parentId: card.id,
                parentName: card.name,
                type: 'card',
                generationName: gen.name,
                variationName: 'V1',
                copyCount: block.copyCount
              });
            }
            if (block.variations) {
              block.variations.forEach(v => {
                if (v.copyCount && v.copyCount > 0) {
                  allStats.push({
                    ...block,
                    parentId: card.id,
                    parentName: card.name,
                    type: 'card',
                    generationName: gen.name,
                    variationName: v.name,
                    copyCount: v.copyCount
                  });
                }
              });
            }
          });
        });
      }
    });

    return allStats.sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
  }, [cards]);

  const promptStats = useMemo(() => {
    const activePrompts = promptProjects.filter(p => !p.deletedAt);
    const allStats: any[] = [];

    activePrompts.forEach(project => {
      (project.blocks || []).forEach(block => {
        if (block.copyCount && block.copyCount > 0) {
          allStats.push({
            ...block,
            parentId: project.id,
            parentName: project.name,
            type: 'prompt',
            variationName: 'V1',
            copyCount: block.copyCount
          });
        }
        if (block.variations) {
          block.variations.forEach(v => {
            if (v.copyCount && v.copyCount > 0) {
              allStats.push({
                ...block,
                parentId: project.id,
                parentName: project.name,
                type: 'prompt',
                variationName: v.name,
                copyCount: v.copyCount
              });
            }
          });
        }
      });
    });

    return allStats.sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
  }, [promptProjects]);

  const currentStats = activeTab === 'cards' ? cardStats : promptStats;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-text-muted" />
          <h2 className="text-2xl font-bold">Copy Statistics</h2>
        </div>
        
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
        </div>
      </div>

      {currentStats.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-text-muted mt-20">
          <p>No header blocks have been copied yet in this section.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto w-full">
          {currentStats.map((stat, index) => (
            <div 
              key={`${stat.parentId}-${stat.id}-${stat.generationName || 'default'}-${stat.variationName}`}
              onClick={() => navigate(stat.type === 'card' ? `/entry/${stat.parentId}` : `/prompt/${stat.parentId}`)}
              className="bg-bg-surface border border-border-main rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-bg-surface-hover flex items-center justify-center text-text-muted font-bold text-sm">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-text-main">
                    {stat.title} 
                    <span className="text-xs text-text-muted ml-2">
                      ({stat.generationName ? `${stat.generationName} - ` : ''}{stat.variationName})
                    </span>
                  </h3>
                  <p className="text-sm text-text-muted">
                    from {stat.parentName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-text-muted bg-bg-main px-3 py-1.5 rounded-lg border border-border-main">
                <Copy className="w-4 h-4" />
                <span className="font-medium">{stat.copyCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
