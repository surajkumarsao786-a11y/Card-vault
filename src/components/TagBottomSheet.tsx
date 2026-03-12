import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface Tag {
  id: string;
  label: string;
  color: string;
}

interface TagBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTag: (tag: { label: string; color: string }) => void;
}

// 40 colors for the color swatch grid
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#fb923c', '#fbbf24', '#fcd34d', '#bef264', '#86efac', '#6ee7b7', '#5eead4',
  '#67e8f9', '#7dd3fc', '#93c5fd', '#a5b4fc', '#c4b5fd', '#d8b4fe', '#f0abfc', '#f9a8d4',
  '#fda4af', '#fdba74', '#fde047', '#fef08a', '#d9f99d', '#bbf7d0', '#a7f3d0', '#99f6e4'
];

const PRESET_TAGS: Tag[] = [
  { id: 'p1', label: 'Important', color: '#ef4444' },
  { id: 'p2', label: 'Draft', color: '#f59e0b' },
  { id: 'p3', label: 'Review', color: '#3b82f6' },
  { id: 'p4', label: 'Done', color: '#22c55e' },
  { id: 'p5', label: 'Idea', color: '#a855f7' },
];

export function TagBottomSheet({ isOpen, onClose, onAddTag }: TagBottomSheetProps) {
  const [label, setLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customTags, setCustomTags] = useState<Tag[]>([]);

  const handleCreateCustomTag = () => {
    if (label.trim()) {
      const newTag = { id: Date.now().toString(), label: label.trim(), color: selectedColor };
      setCustomTags([...customTags, newTag]);
      setLabel('');
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const toggleTag = (tag: Tag) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag.id)) {
      newSelected.delete(tag.id);
    } else {
      newSelected.add(tag.id);
      onAddTag({ label: tag.label, color: tag.color });
    }
    setSelectedTags(newSelected);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const deleteCustomTag = (id: string) => {
    setCustomTags(customTags.filter(t => t.id !== id));
    const newSelected = new Set(selectedTags);
    newSelected.delete(id);
    setSelectedTags(newSelected);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-surface rounded-t-[16px] z-50 shadow-2xl flex flex-col"
            style={{ 
              paddingBottom: 'var(--safe-bottom, 52px)',
              maxHeight: 'calc(80vh - var(--safe-bottom, 52px))'
            }}
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-12 h-1.5 bg-border-main rounded-full" />
            </div>

            <div className="p-6 pt-2 flex flex-col gap-8 overflow-y-auto">
              <div className="flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold">Select Tags</h2>
                <button onClick={onClose} className="p-2 bg-bg-surface-hover rounded-full">
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-text-muted -mt-4 shrink-0">
                Tap to select as sub-tag. Double-tap to set as main tag.
              </p>

              {/* Preset Tags */}
              <div className="flex flex-col gap-3 shrink-0">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Preset Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map(tag => {
                    const isSelected = selectedTags.has(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all border-2"
                        style={{
                          borderColor: tag.color,
                          backgroundColor: isSelected ? tag.color : 'transparent',
                          color: isSelected ? '#fff' : tag.color
                        }}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border-main shrink-0" />

              {/* Custom Tags */}
              {customTags.length > 0 && (
                <div className="flex flex-col gap-3 shrink-0">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Custom Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {customTags.map(tag => {
                      const isSelected = selectedTags.has(tag.id);
                      return (
                        <div
                          key={tag.id}
                          className="flex items-center rounded-full border-2 overflow-hidden transition-all"
                          style={{
                            borderColor: tag.color,
                            backgroundColor: isSelected ? tag.color : 'transparent',
                          }}
                        >
                          <button
                            onClick={() => toggleTag(tag)}
                            className="px-4 py-2 text-sm font-medium"
                            style={{ color: isSelected ? '#fff' : tag.color }}
                          >
                            {tag.label}
                          </button>
                          <button
                            onClick={() => deleteCustomTag(tag.id)}
                            className="px-2 py-2 hover:bg-black/10 transition-colors"
                            style={{ color: isSelected ? '#fff' : tag.color }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Create Custom Tag */}
              <div className="flex flex-col gap-4 shrink-0">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Create Custom Tag</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Tag name..."
                    className="flex-1 p-3 bg-bg-surface-hover rounded-xl outline-none text-base focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    onClick={handleCreateCustomTag}
                    disabled={!label.trim()}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    Add
                  </button>
                </div>

                {/* Color Swatch Grid */}
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                  <div className="grid grid-rows-2 grid-flow-col gap-2 w-max">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className="relative w-11 h-11 rounded-full flex-shrink-0 transition-transform hover:scale-110 flex items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && (
                          <Check size={20} strokeWidth={3} className="text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
