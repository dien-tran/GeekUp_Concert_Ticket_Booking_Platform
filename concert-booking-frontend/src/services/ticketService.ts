import { AxiosResponse } from 'axios';
import { axiosInstance } from './api';
import {
  APIResponse,
  TicketCategory,
  TicketCategoryCreateRequest,
  TicketCategoryUpdateRequest,
  HoldTicketRequest,
  HoldTicketResponse,
} from '../types';

/**
 * ticketService — ticket category and seat management.
 * Backend: GET /tickets, GET /tickets/{id},
 *          GET /tickets/concerts/{concertId},
 *          POST /tickets, PUT /tickets/{id},
 *          POST /tickets/hold
 */
export const ticketService = {
  getAllTickets: (): Promise<AxiosResponse<APIResponse<TicketCategory[]>>> =>
    axiosInstance.get<APIResponse<TicketCategory[]>>('/tickets'),

  getTicketById: (id: string): Promise<AxiosResponse<APIResponse<TicketCategory>>> =>
    axiosInstance.get<APIResponse<TicketCategory>>(`/tickets/${id}`),

  getTicketsByConcert: (concertId: string): Promise<AxiosResponse<APIResponse<TicketCategory[]>>> =>
    axiosInstance.get<APIResponse<TicketCategory[]>>(`/tickets/concerts/${concertId}`),

  createTicketCategory: (data: TicketCategoryCreateRequest): Promise<AxiosResponse<APIResponse<TicketCategory>>> =>
    axiosInstance.post<APIResponse<TicketCategory>>('/tickets', data),

  updateTicketCategory: (id: string, data: TicketCategoryUpdateRequest): Promise<AxiosResponse<APIResponse<TicketCategory>>> =>
    axiosInstance.put<APIResponse<TicketCategory>>(`/tickets/${id}`, data),

  holdTickets: (data: HoldTicketRequest): Promise<AxiosResponse<APIResponse<HoldTicketResponse>>> =>
    axiosInstance.post<APIResponse<HoldTicketResponse>>('/tickets/hold', data),
};
