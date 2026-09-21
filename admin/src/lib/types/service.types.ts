export type Service = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priceLabel?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceInput = {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  priceLabel?: string;
  priority?: number;
  isActive?: boolean;
};

export type ServiceBookingStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ServiceBooking = {
  id: string;
  serviceId: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: ServiceBookingStatus;
  createdAt: string;
  updatedAt: string;
  service?: { id: string; name: string; slug: string };
};
