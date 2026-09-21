export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  priority?: number;
  isActive?: boolean;
};
