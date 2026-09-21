export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
