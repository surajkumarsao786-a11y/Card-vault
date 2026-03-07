import localforage from 'localforage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Card, Project, Tag } from './types';

const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'Fantasy', color: 'bg-red-500' },
  { id: '2', name: 'Sci-Fi', color: 'bg-blue-500' },
  { id: '3', name: 'Modern', color: 'bg-green-500' },
  { id: '4', name: 'Historical', color: 'bg-yellow-500' },
  { id: '5', name: 'Horror', color: 'bg-purple-500' },
  { id: '6', name: 'Romance', color: 'bg-pink-500' },
  { id: '7', name: 'Action', color: 'bg-orange-500' },
  { id: '8', name: 'Mystery', color: 'bg-teal-500' },
  { id: '9', name: 'Slice of Life', color: 'bg-indigo-500' },
  { id: '10', name: 'Magic', color: 'bg-violet-500' },
  { id: '11', name: 'Cyberpunk', color: 'bg-cyan-500' },
  { id: '12', name: 'Steampunk', color: 'bg-amber-500' },
  { id: '13', name: 'Post-Apocalyptic', color: 'bg-stone-500' },
  { id: '14', name: 'Superhero', color: 'bg-rose-500' },
  { id: '15', name: 'Supernatural', color: 'bg-fuchsia-500' },
  { id: '16', name: 'Mythology', color: 'bg-emerald-500' },
  { id: '17', name: 'Space Opera', color: 'bg-sky-500' },
  { id: '18', name: 'Urban Fantasy', color: 'bg-lime-500' },
  { id: '19', name: 'Dystopian', color: 'bg-zinc-500' },
  { id: '20', name: 'Isekai', color: 'bg-slate-500' },
];

interface AppState {
  cards: Card[];
  projects: Project[];
  tags: Tag[];
  addCard: (card: Card) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTag: (tag: Tag) => Promise<void>;
  loading: boolean;
}

const StoreContext = createContext<AppState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const storedCards = await localforage.getItem<Card[]>('cards') || [];
      const storedProjects = await localforage.getItem<Project[]>('projects') || [];
      const storedTags = await localforage.getItem<Tag[]>('tags') || DEFAULT_TAGS;

      setCards(storedCards);
      setProjects(storedProjects);
      setTags(storedTags);
      setLoading(false);
    };
    loadData();
  }, []);

  const saveCards = async (newCards: Card[]) => {
    setCards(newCards);
    await localforage.setItem('cards', newCards);
  };

  const saveProjects = async (newProjects: Project[]) => {
    setProjects(newProjects);
    await localforage.setItem('projects', newProjects);
  };

  const saveTags = async (newTags: Tag[]) => {
    setTags(newTags);
    await localforage.setItem('tags', newTags);
  };

  const addCard = async (card: Card) => saveCards([...cards, card]);
  const updateCard = async (card: Card) => saveCards(cards.map(c => c.id === card.id ? card : c));
  const deleteCard = async (id: string) => saveCards(cards.filter(c => c.id !== id));

  const addProject = async (project: Project) => saveProjects([...projects, project]);
  const updateProject = async (project: Project) => saveProjects(projects.map(p => p.id === project.id ? project : p));
  const deleteProject = async (id: string) => saveProjects(projects.filter(p => p.id !== id));

  const addTag = async (tag: Tag) => saveTags([...tags, tag]);

  return (
    <StoreContext.Provider value={{ cards, projects, tags, addCard, updateCard, deleteCard, addProject, updateProject, deleteProject, addTag, loading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
