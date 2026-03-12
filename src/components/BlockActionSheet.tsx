import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, CopyPlus } from 'lucide-react';

interface BlockActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

export function BlockActionSheet({ isOpen, onClose, onDuplicate, onDelete, onCopy }: BlockActionSheetProps) {
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
            style={{ paddingBottom: 'var(--safe-bottom, 52px)' }}
          >
            <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-12 h-1.5 bg-border-main rounded-full" />
            </div>

            <div className="flex flex-col p-4 gap-2">
              <button
                onClick={() => { onCopy(); onClose(); }}
                className="flex items-center gap-3 w-full p-4 min-h-[48px] text-left text-lg font-medium hover:bg-bg-surface-hover rounded-xl transition-colors"
              >
                <Copy size={20} className="text-text-muted" />
                Copy Text
              </button>
              <button
                onClick={() => { onDuplicate(); onClose(); }}
                className="flex items-center gap-3 w-full p-4 min-h-[48px] text-left text-lg font-medium hover:bg-bg-surface-hover rounded-xl transition-colors"
              >
                <CopyPlus size={20} className="text-text-muted" />
                Duplicate Block
              </button>
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="flex items-center gap-3 w-full p-4 min-h-[48px] text-left text-lg font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
                Delete Block
              </button>

              <div className="h-px bg-border-main my-2" />

              <button
                onClick={onClose}
                className="w-full p-4 min-h-[48px] text-center text-lg font-bold text-text-muted hover:bg-bg-surface-hover rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
