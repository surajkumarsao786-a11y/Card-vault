import React, { useMemo } from 'react';
import { useStore } from '../store';
import { BarChart3, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Statistics() {
  const { cards } = useStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const allBlocks = cards.flatMap(card => 
      card.headerBlocks.map(block => ({
        ...block,
        cardId: card.id,
        cardName: card.name,
      }))
    );

    return allBlocks
      .filter(block => block.copyCount && block.copyCount > 0)
      .sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
  }, [cards]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6 px-2">
        <BarChart3 className="w-8 h-8 text-zinc-400" />
        <h2 className="text-2xl font-bold">Copy Statistics</h2>
      </div>

      {stats.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-zinc-500 mt-20">
          <p>No header blocks have been copied yet.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto w-full">
          {stats.map((stat, index) => (
            <div 
              key={`${stat.cardId}-${stat.id}`}
              onClick={() => navigate(`/entry/${stat.cardId}`)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{stat.title}</h3>
                  <p className="text-sm text-zinc-500">from {stat.cardName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
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
