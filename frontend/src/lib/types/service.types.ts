export type Service = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priceLabel?: string | null;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ServiceBookingInput = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
};

export type ServiceBookingResponse = {
  id: string;
  serviceId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
};
