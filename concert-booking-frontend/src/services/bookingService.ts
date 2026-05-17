import { AxiosResponse } from 'axios';
import { axiosInstance } from './api';
import { APIResponse, Booking, BookingCreateRequest } from '../types';

/**
 * bookingService — booking management.
 * Backend: POST /bookings, GET /bookings/me,
 *          GET /bookings/user/{userId}, GET /bookings/admin,
 *          DELETE /bookings/{id}, PATCH /bookings/{id}/confirm,
 *          POST /bookings/scanQr
 */
export const bookingService = {
  /** Create a new booking (ticketIds must already be in HOLD status via holdTickets) */
  createBooking: (data: BookingCreateRequest): Promise<AxiosResponse<APIResponse<Booking>>> =>
    axiosInstance.post<APIResponse<Booking>>('/bookings', data),

  /** Get current user's bookings */
  getMyBookings: (): Promise<AxiosResponse<APIResponse<Booking[]>>> =>
    axiosInstance.get<APIResponse<Booking[]>>('/bookings/me'),

  /** Get bookings by userId (legacy fallback) */
  getBookingsByUser: (userId: string): Promise<AxiosResponse<APIResponse<Booking[]>>> =>
    axiosInstance.get<APIResponse<Booking[]>>(`/bookings/user/${userId}`),

  /** Admin: get all bookings */
  getAdminBookings: (): Promise<AxiosResponse<APIResponse<Booking[]>>> =>
    axiosInstance.get<APIResponse<Booking[]>>('/bookings/admin'),

  /** Cancel/delete a booking */
  cancelBooking: (bookingId: string): Promise<AxiosResponse<APIResponse<any>>> =>
    axiosInstance.delete<APIResponse<any>>(`/bookings/${bookingId}`),

  /** Admin: confirm a booking */
  confirmBooking: (bookingId: string): Promise<AxiosResponse<APIResponse<any>>> =>
    axiosInstance.patch<APIResponse<any>>(`/bookings/${bookingId}/confirm`),

  /** Admin/staff: scan QR token */
  scanQr: (token: string): Promise<AxiosResponse<APIResponse<any>>> =>
    axiosInstance.post<APIResponse<any>>('/bookings/scanQr', { token }),
};

/**
 * paymentService — payment via VNPay.
 * Backend: POST /payment/checkout
 * The checkout endpoint takes the same BookingRequest shape and returns a VNPay payment URL.
 */
export const paymentService = {
  checkout: (data: BookingCreateRequest): Promise<AxiosResponse<APIResponse<{ url: string }>>> =>
    axiosInstance.post<APIResponse<{ url: string }>>('/payment/checkout', data),

  /** Legacy alias used by older components */
  checkoutPayment: (data: any): Promise<AxiosResponse<APIResponse<{ url: string }>>> =>
    axiosInstance.post<APIResponse<{ url: string }>>('/payment/checkout', data),
};

/**
 * userService — user registration and profile.
 * Backend: POST /users (register), GET /users/myInfo, GET /users, GET /users/{id}
 */
export const userService = {
  register: (data: { name: string; email: string; password: string; phone: string }) =>
    axiosInstance.post<APIResponse<any>>('/users', data, { skipAuth: true } as any),

  getMyInfo: () =>
    axiosInstance.get<APIResponse<any>>('/users/myInfo'),

  getAllUsers: () =>
    axiosInstance.get<APIResponse<any[]>>('/users'),

  getUserById: (id: string) =>
    axiosInstance.get<APIResponse<any>>(`/users/${id}`),

  updateUser: (id: string, data: any) =>
    axiosInstance.put<APIResponse<any>>(`/users/${id}`, data),

  updateUserStatus: (id: string, data: { status: string }) =>
    axiosInstance.patch<APIResponse<any>>(`/users/${id}/status`, data),

  assignRole: (id: string, data: { roles: string[] }) =>
    axiosInstance.put<APIResponse<any>>(`/users/${id}/roles`, data),
};
