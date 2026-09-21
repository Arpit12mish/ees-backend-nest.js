export type FaqEntityType = 'PRODUCT' | 'CATEGORY' | 'GLOBAL' | 'GUIDE';

export type Faq = {
  id: string;
  entityType: FaqEntityType;
  entityId?: string | null;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FaqInput = {
  entityType: FaqEntityType;
  entityId?: string;
  question: string;
  answer: string;
  sortOrder?: number;
  isActive?: boolean;
};
