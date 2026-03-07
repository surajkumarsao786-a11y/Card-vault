import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Card, HeaderBlock, Tag } from '../types';
import { generateId, fileToBase64, cn } from '../utils';
import { Plus, X, ChevronLeft, ChevronRight, ChevronDown, Copy, Check, Save, ImagePlus, Tag as TagIcon, Maximize, Minimize, Trash2, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDebounce } from 'use-debounce';
import ConfirmModal from '../components/ConfirmModal';

const TAG_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-amber-500',
  'bg-stone-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-emerald-500',
  'bg-sky-500', 'bg-lime-500', 'bg-zinc-500', 'bg-slate-500'
];

export default function EntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cards, tags, addCard, updateCard, addTag, deleteCard } = useStore();
  
  const [name, setName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [headerBlocks, setHeaderBlocks] = useState<HeaderBlock[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save logic
  const [debouncedName] = useDebounce(name, 1000);
  const [debouncedSummary] = useDebounce(summary, 1000);
  const [debouncedHeaderBlocks] = useDebounce(headerBlocks, 1000);
  const [debouncedTags] = useDebounce(selectedTags, 1000);
  const [debouncedImages] = useDebounce(images, 1000);

  const isInitialMount = useRef(true);
  const currentCardId = useRef(id || generateId());

  useEffect(() => {
    if (id) {
      const card = cards.find(c => c.id === id);
      if (card) {
        setName(card.name);
        setImages(card.images);
        setSummary(card.summary);
        setSelectedTags(card.tags);
        setHeaderBlocks(card.headerBlocks);
      }
    }
  }, [id, cards]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!debouncedName.trim()) return;

    const saveCard = async () => {
      const cardData: Card = {
        id: currentCardId.current,
        name: debouncedName,
        images: debouncedImages,
        summary: debouncedSummary,
        tags: debouncedTags,
        headerBlocks: debouncedHeaderBlocks,
        createdAt: id ? (cards.find(c => c.id === id)?.createdAt || Date.now()) : Date.now(),
      };

      const exists = cards.some(c => c.id === currentCardId.current);
      if (exists) {
        await updateCard(cardData);
      } else {
        await addCard(cardData);
        // We don't navigate here so the user can keep editing
      }
    };

    saveCard();
  }, [debouncedName, debouncedSummary, debouncedHeaderBlocks, debouncedTags, debouncedImages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const base64Images = await Promise.all(files.map(fileToBase64));
      setImages(prev => [...prev, ...base64Images]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= images.length - 1) {
      setCurrentImageIndex(Math.max(0, images.length - 2));
    }
  };

  const addHeaderBlock = () => {
    setHeaderBlocks(prev => [...prev, { id: generateId(), title: 'New Block', content: '' }]);
  };

  const updateHeaderBlock = (id: string, updates: Partial<HeaderBlock>) => {
    setHeaderBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeHeaderBlock = (id: string) => {
    setHeaderBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleManualSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }
    
    const cardData: Card = {
      id: currentCardId.current,
      name,
      images,
      summary,
      tags: selectedTags,
      headerBlocks,
      createdAt: id ? (cards.find(c => c.id === id)?.createdAt || Date.now()) : Date.now(),
    };

    const exists = cards.some(c => c.id === currentCardId.current);
    if (exists) {
      await updateCard(cardData);
    } else {
      await addCard(cardData);
    }
    navigate('/');
  };

  const handleDelete = async () => {
    if (id) {
      await deleteCard(id);
    }
    navigate('/');
  };

  const handleCreateCustomTag = async () => {
    if (!newTagName.trim()) return;
    const newTag: Tag = {
      id: generateId(),
      name: newTagName,
      color: newTagColor,
    };
    await addTag(newTag);
    setSelectedTags(prev => [...prev, newTag.id]);
    setNewTagName('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24 relative">
      <div className="p-4 max-w-3xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <input 
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Entry Name"
            className="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-zinc-600 w-full"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                const text = `Name: ${name}\nSummary: ${summary}\n\n${headerBlocks.map(b => `// ${b.title} //\n${b.content}`).join('\n\n')}`;
                navigator.clipboard.writeText(text);
                alert('Card text copied to clipboard!');
              }}
              className="p-3 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center"
              title="Export / Share Text"
            >
              <Copy className="w-5 h-5" />
            </button>
            {id && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center"
                title="Delete Card"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={handleManualSave}
              className="p-3 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-white transition-colors flex items-center justify-center"
              title="Save Card"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center group">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt="Gallery" 
                className={cn("w-full h-full transition-all duration-300", imageFit === 'cover' ? 'object-cover' : 'object-contain')} 
              />
              
              {/* Image Controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4">
                <button 
                  onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentImageIndex === 0}
                  className="p-2 bg-black/50 text-white rounded-full disabled:opacity-30 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                  disabled={currentImageIndex === images.length - 1}
                  className="p-2 bg-black/50 text-white rounded-full disabled:opacity-30 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              {/* Top Right Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setShowZoomModal(true)}
                  className="p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-zinc-800 transition-colors"
                  title="Zoom Image"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setImageFit(prev => prev === 'cover' ? 'contain' : 'cover')}
                  className="p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-zinc-800 transition-colors"
                  title="Toggle Image Fit"
                >
                  {imageFit === 'cover' ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-zinc-800 transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => removeImage(currentImageIndex)}
                  className="p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-red-500/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i === currentImageIndex ? "bg-white w-4" : "bg-white/50")} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <span className="font-medium">Add Images</span>
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Summary & Tags */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => setShowTagModal(true)}
              className="mt-1 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors shrink-0"
            >
              <TagIcon className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex-1 space-y-3">
              <textarea 
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Write a summary..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 min-h-[100px] resize-y"
              />
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span key={tag.id} className={cn("text-xs font-medium px-3 py-1 rounded-full text-white", tag.color)}>
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header Blocks */}
        <div className="space-y-6 pt-4">
          {headerBlocks.map((block) => (
            <HeaderBlockItem 
              key={block.id} 
              block={block} 
              onUpdate={(updates) => updateHeaderBlock(block.id, updates)}
              onRemove={() => removeHeaderBlock(block.id)}
            />
          ))}
        </div>
      </div>

      {/* Floating Add Block Button */}
      <button 
        onClick={addHeaderBlock}
        className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-2xl shadow-2xl flex items-center justify-center hover:bg-zinc-700 transition-all z-10"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Zoom Modal */}
      {showZoomModal && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4">
          <button 
            onClick={() => setShowZoomModal(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={images[currentImageIndex]} 
            alt="Zoomed Gallery" 
            className="max-w-full max-h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentImageIndex === 0}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full disabled:opacity-30 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                disabled={currentImageIndex === images.length - 1}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full disabled:opacity-30 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md border border-zinc-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-semibold">Select Tags</h3>
              <button onClick={() => setShowTagModal(false)} className="p-2 hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTags(prev => 
                          isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                        );
                      }}
                      className={cn(
                        "text-sm font-medium px-4 py-2 rounded-full transition-all border",
                        isSelected 
                          ? cn(tag.color, "text-white border-transparent") 
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                      )}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 pt-4 border-t border-zinc-800 space-y-4">
              <h4 className="text-sm font-medium text-zinc-400">Create Custom Tag</h4>
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-all",
                      color,
                      newTagColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110" : "opacity-50 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="New custom tag..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  onKeyDown={e => e.key === 'Enter' && handleCreateCustomTag()}
                />
                <button 
                  onClick={handleCreateCustomTag}
                  className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-xl font-medium hover:bg-white transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

function HeaderBlockItem({ block, onUpdate, onRemove }: { key?: React.Key, block: HeaderBlock, onUpdate: (u: Partial<HeaderBlock>) => void, onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    onUpdate({ copyCount: (block.copyCount || 0) + 1 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl overflow-hidden transition-all mx-2 sm:mx-8 shadow-lg">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center flex-1">
          {expanded ? <ChevronDown className="w-5 h-5 text-zinc-500 mr-3" /> : <ChevronRight className="w-5 h-5 text-zinc-500 mr-3" />}
          <input 
            type="text"
            value={block.title}
            onChange={e => onUpdate({ title: e.target.value })}
            onClick={e => e.stopPropagation()}
            className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full text-zinc-100"
            placeholder="Header block"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button 
            onClick={handleCopy}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl transition-colors"
            title="Copy content"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-zinc-800/50 mt-2 relative">
              <div className="absolute left-5 top-6 bottom-5 w-0.5 bg-zinc-800 rounded-full" />
              <textarea 
                value={block.content}
                onChange={e => onUpdate({ content: e.target.value })}
                placeholder="Type anything here..."
                maxLength={20000}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-300 min-h-[200px] resize-y mt-4 pl-6 font-mono text-sm leading-relaxed"
              />
              <div className="text-right text-xs text-zinc-600 mt-2 font-mono">
                {block.content.length} / 20,000
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
