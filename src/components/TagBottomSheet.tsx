import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface TagBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTag: (tag: { label: string; color: string }) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

export function TagBottomSheet({ isOpen, onClose, onAddTag }: TagBottomSheetProps) {
  const [label, setLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (label.trim()) {
      onAddTag({ label: label.trim(), color: selectedColor });
      setLabel('');
      onClose();
      if (navigator.vibrate) navigator.vibrate(50);
    }
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
            className="fixed bottom-0 left-0 right-0 bg-bg-surface rounded-t-[32px] z-50 shadow-2xl flex flex-col max-h-[90vh]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-border-main  rounded-full" />
            </div>

            <div className="p-6 pt-2 flex flex-col gap-6 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Add Tag</h2>
                <button onClick={onClose} className="p-2 bg-bg-surface-hover rounded-full">
                  <X size={20} />
                </button>
              </div>

              {/* Input pinned to top of sheet content */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-muted ">Tag Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Important"
                  className="w-full p-4 bg-bg-surface-hover rounded-2xl outline-none text-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                  autoFocus
                />
              </div>

              {/* Horizontal scrolling color row */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-muted ">Color</label>
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="relative w-12 h-12 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center text-text-main">
                          <Check size={20} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!label.trim()}
                className="w-full py-4 bg-indigo-500 text-text-main rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                Create Tag
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
