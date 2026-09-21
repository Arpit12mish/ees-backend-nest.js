import { apiFetch, apiMutation } from './api-client';
import type {
  Service,
  ServiceInput,
  ServiceBooking,
  ServiceBookingStatus,
} from '@/lib/types/service.types';

export function getServices(token?: string | null) {
  return apiFetch<Service[]>('/admin/services', { noStore: true, token });
}

export function getService(id: string, token?: string | null) {
  return apiFetch<Service>(`/admin/services/${id}`, { noStore: true, token });
}

export function createService(input: ServiceInput, token?: string | null) {
  return apiMutation<Service>('/admin/services', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateService(
  id: string,
  input: Partial<ServiceInput>,
  token?: string | null,
) {
  return apiMutation<Service>(`/admin/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteService(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/services/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function getServiceBookings(token?: string | null) {
  return apiFetch<ServiceBooking[]>('/admin/service-bookings', {
    noStore: true,
    token,
  });
}

export function getServiceBooking(id: string, token?: string | null) {
  return apiFetch<ServiceBooking>(`/admin/service-bookings/${id}`, {
    noStore: true,
    token,
  });
}

export function updateServiceBookingStatus(
  id: string,
  status: ServiceBookingStatus,
  token?: string | null,
) {
  return apiMutation<ServiceBooking>(`/admin/service-bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}
