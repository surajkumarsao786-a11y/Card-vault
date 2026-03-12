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

// 16 colors in 8x2 grid — min 44x44px touch targets
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#fbbf24', '#86efac', '#67e8f9',
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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-surface rounded-t-[16px] z-50 shadow-2xl flex flex-col overflow-hidden"
            style={{ 
              paddingBottom: 'var(--safe-bottom, 52px)',
              maxHeight: 'calc(85vh - var(--safe-bottom, 52px))'
            }}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-border-main rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-3 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">Select Tags</h2>
              <button onClick={onClose} className="p-2 bg-bg-surface-hover rounded-full transition-colors hover:bg-bg-main">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              <p className="text-sm text-text-muted mb-4 shrink-0">
                Tap to select as sub-tag. Double-tap to set as main tag.
              </p>

              {/* Preset Tags */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Preset Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map(tag => {
                    const isSelected = selectedTags.has(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag)}
                        className="px-4 py-2.5 rounded-full text-sm font-medium transition-all border-2 min-h-[44px]"
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

              {/* Divider */}
              <div className="h-px bg-border-main mb-6" />

              {/* Custom Tags */}
              {customTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Custom Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {customTags.map(tag => {
                      const isSelected = selectedTags.has(tag.id);
                      return (
                        <div
                          key={tag.id}
                          className="flex items-center rounded-full border-2 overflow-hidden transition-all min-h-[44px]"
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
            </div>

            {/* Create Custom Tag — fixed bottom section */}
            <div className="shrink-0 px-6 pt-5 pb-4 border-t border-border-main bg-bg-surface space-y-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Create New Tag</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateCustomTag()}
                  placeholder="Tag name..."
                  className="flex-1 p-3 bg-bg-main border border-border-main rounded-xl outline-none text-base focus:ring-2 focus:ring-accent transition-all"
                />
                <button
                  onClick={handleCreateCustomTag}
                  disabled={!label.trim()}
                  className="px-5 py-3 bg-accent text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] min-w-[60px]"
                >
                  Add
                </button>
              </div>

              {/* Color Swatch Grid — 8x2 with 44px min touch targets */}
              <div className="grid grid-cols-8 gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="relative aspect-square rounded-full flex-shrink-0 transition-transform hover:scale-110 flex items-center justify-center min-w-[44px] min-h-[44px]"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Check size={18} strokeWidth={3} className="text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
