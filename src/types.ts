export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface HeaderBlock {
  id: string;
  title: string;
  content: string;
  copyCount?: number;
}

export interface Card {
  id: string;
  name: string;
  images: string[];
  summary: string;
  tags: string[];
  headerBlocks: HeaderBlock[];
  createdAt: number;
  isPinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  cardIds: string[];
  createdAt: number;
  color?: string;
}
