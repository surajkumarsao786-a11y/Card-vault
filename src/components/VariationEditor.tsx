import React, { useRef } from 'react';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { Undo2, Redo2, Copy } from 'lucide-react';

interface VariationEditorProps {
  key?: React.Key;
  id: string;
  initialText: string;
  onSave: (text: string) => void;
}

export function VariationEditor({ id, initialText, onSave }: VariationEditorProps) {
  const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo(initialText);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    set(val);
    
    // Debounce save to parent to avoid global re-renders messing up local state
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(val);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(state);
    // Haptic feedback simulation
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-bg-surface-hover rounded-2xl border border-border-main backdrop-blur-md">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={undo} 
            disabled={!canUndo}
            className="p-2 rounded-full hover:bg-border-main disabled:opacity-30 transition-colors"
          >
            <Undo2 size={18} />
          </button>
          <button 
            type="button" 
            onClick={redo} 
            disabled={!canRedo}
            className="p-2 rounded-full hover:bg-border-main disabled:opacity-30 transition-colors"
          >
            <Redo2 size={18} />
          </button>
        </div>
        <button 
          type="button" 
          onClick={handleCopy}
          className="p-2 rounded-full hover:bg-border-main transition-colors text-indigo-500"
        >
          <Copy size={18} />
        </button>
      </div>
      <textarea
        value={state}
        onChange={handleChange}
        className="w-full min-h-[120px] bg-transparent resize-none outline-none text-base leading-relaxed"
        placeholder="Enter text here..."
        onKeyDown={(e) => {
          // Prevent any parent form submission on Enter
          if (e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
      />
    </div>
  );
}
