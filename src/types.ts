export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'action' | 'strategy' | 'puzzle' | 'adventure';
  rating: number;
  releaseDate: string; // ISO date format: 'YYYY-MM-DD'
}

export interface aboutCollection {
  docs: string;
  description: string;
}
export interface HeroContent {
  title: string;
  description: string;
  videoUrl: string;
}
export type News = {
  id: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  status: "draft" | "published";
  createdAt?: any;
  updatedAt?: any;
};
