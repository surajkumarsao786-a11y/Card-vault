import React from 'react';
import { Card } from '../types';
import { useStore } from '../store';
import { cn } from '../utils';
import { motion } from 'motion/react';
import { Pin } from 'lucide-react';

interface CardItemProps {
  key?: React.Key;
  card: Card;
  selected?: boolean;
  onSelect?: () => void;
  onLongPress?: () => void;
  onClick?: () => void;
}

export default function CardItem({ card, selected, onSelect, onLongPress, onClick }: CardItemProps) {
  const { tags, updateCard } = useStore();
  
  let timer: ReturnType<typeof setTimeout>;

  const handleTouchStart = () => {
    timer = setTimeout(() => {
      if (onLongPress) onLongPress();
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(timer);
  };

  const handleClick = () => {
    if (selected !== undefined && onSelect) {
      onSelect();
    } else if (onClick) {
      onClick();
    }
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCard({ ...card, isPinned: !card.isPinned });
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-3xl overflow-hidden bg-zinc-900 border transition-all duration-300 cursor-pointer mb-4 break-inside-avoid shadow-lg group",
        selected ? "border-zinc-100 ring-2 ring-zinc-100 shadow-zinc-100/20" : "border-zinc-800/50 hover:border-zinc-700 hover:shadow-xl"
      )}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <button
        onClick={togglePin}
        className={cn(
          "absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all",
          card.isPinned 
            ? "bg-zinc-100 text-zinc-900 opacity-100" 
            : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
        )}
      >
        <Pin className="w-4 h-4" />
      </button>

      {card.images.length > 0 ? (
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <img 
            src={card.images[0]} 
            alt={card.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end">
            <h3 className="font-bold text-xl text-white mb-1.5 line-clamp-1 drop-shadow-md">{card.name}</h3>
            {card.summary && (
              <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed mb-3 drop-shadow-sm">{card.summary}</p>
            )}
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {card.tags.slice(0, 3).map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <span key={tag.id} className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full text-white/90 backdrop-blur-md border border-white/10", tag.color)}>
                      {tag.name}
                    </span>
                  );
                })}
                {card.tags.length > 3 && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 backdrop-blur-md border border-white/10">
                    +{card.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <h3 className="font-bold text-xl text-white mb-2 line-clamp-1">{card.name}</h3>
          {card.summary && (
            <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-4">{card.summary}</p>
          )}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <span key={tag.id} className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full text-white/90", tag.color)}>
                    {tag.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {selected && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center shadow-xl"
          >
            <div className="w-4 h-4 bg-zinc-900 rounded-full" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
