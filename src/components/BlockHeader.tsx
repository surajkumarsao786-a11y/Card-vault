import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BlockHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  onTitleChange: (newTitle: string) => void;
  dragControls: any;
}

export function BlockHeader({ title, isExpanded, onToggle, onTitleChange, dragControls }: BlockHeaderProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const debounceRef = useRef<NodeJS.Timeout>();
  const longPressTimerRef = useRef<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onTitleChange(val);
    }, 1000);
  };

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onTitleChange(localTitle);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // We need to persist the event if we are going to use it asynchronously
    if (e.persist) e.persist();
    
    longPressTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      dragControls.start(e);
    }, 400); // 400ms for long press
  };

  const handlePointerUpOrCancel = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-bg-surface rounded-t-3xl border-b border-border-main select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onPointerLeave={handlePointerUpOrCancel}
      style={{ touchAction: 'none' }}
    >
      <input
        type="text"
        value={localTitle}
        onChange={handleChange}
        onBlur={handleBlur}
        className="bg-transparent text-lg font-semibold outline-none flex-1 mr-4 cursor-text"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking input
      />
      <button 
        type="button" 
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking toggle
        className="p-2 rounded-full hover:bg-bg-surface-hover transition-colors"
      >
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
    </div>
  );
}
