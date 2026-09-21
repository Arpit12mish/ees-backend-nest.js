import { apiFetch, apiMutation } from './api-client';
import type {
  Service,
  ServiceBookingInput,
  ServiceBookingResponse,
} from '@/lib/types/service.types';

export function getServices() {
  return apiFetch<Service[]>('/public/services', { revalidate: 600 });
}

export function getService(slug: string) {
  return apiFetch<Service>(`/public/services/${slug}`, { revalidate: 600 });
}

export function submitServiceBooking(
  serviceId: string,
  input: ServiceBookingInput,
) {
  return apiMutation<ServiceBookingResponse>(
    `/public/services/${serviceId}/bookings`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}
