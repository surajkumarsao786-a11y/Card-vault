import React, { useState } from 'react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
import { BlockHeader } from './BlockHeader';
import { VariationEditor } from './VariationEditor';
import { Plus } from 'lucide-react';

interface Variation {
  id: string;
  versionLabel: string;
  textContent: string;
}

interface Block {
  id: string;
  title: string;
  isExpanded: boolean;
  variations: Variation[];
}

interface BlockItemProps {
  key?: React.Key;
  block: Block;
  onUpdate: (updatedBlock: Block) => void;
}

export function BlockItem({ block, onUpdate }: BlockItemProps) {
  const dragControls = useDragControls();
  const [activeVariationId, setActiveVariationId] = useState(block.variations[0]?.id);

  const handleTitleChange = (newTitle: string) => {
    onUpdate({ ...block, title: newTitle });
  };

  const handleToggle = () => {
    onUpdate({ ...block, isExpanded: !block.isExpanded });
  };

  const handleVariationSave = (variationId: string, newText: string) => {
    const updatedVariations = block.variations.map(v => 
      v.id === variationId ? { ...v, textContent: newText } : v
    );
    onUpdate({ ...block, variations: updatedVariations });
  };

  return (
    <Reorder.Item 
      value={block} 
      id={block.id}
      dragListener={false}
      dragControls={dragControls}
      className="mb-4 bg-bg-surface rounded-3xl shadow-sm border border-border-main overflow-hidden"
    >
      <BlockHeader 
        title={block.title}
        isExpanded={block.isExpanded}
        onToggle={handleToggle}
        onTitleChange={handleTitleChange}
        dragControls={dragControls}
      />
      
      <AnimatePresence initial={false}>
        {block.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {/* Variation Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {block.variations.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveVariationId(v.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeVariationId === v.id 
                        ? 'bg-indigo-500 text-text-main shadow-md' 
                        : 'bg-bg-surface-hover text-text-secondary  hover:bg-border-main'
                    }`}
                  >
                    {v.versionLabel}
                  </button>
                ))}
                <button type="button" className="px-4 py-2 rounded-full bg-bg-surface-hover text-text-secondary  hover:bg-border-main transition-all flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>

              {/* Active Variation Editor */}
              {block.variations.map(v => (
                v.id === activeVariationId && (
                  <VariationEditor 
                    key={v.id} // Important: keep key stable per variation
                    id={v.id}
                    initialText={v.textContent}
                    onSave={(text) => handleVariationSave(v.id, text)}
                  />
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
