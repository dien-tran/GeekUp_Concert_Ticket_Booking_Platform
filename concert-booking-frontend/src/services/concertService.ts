import { AxiosResponse } from 'axios';
import { axiosInstance } from './api';
import { APIResponse, Concert, ConcertCreateRequest, normalizeConcert } from '../types';

/**
 * concertService — all concert endpoints.
 * Backend: GET/POST /concerts, GET/PUT/DELETE /concerts/{id},
 *          GET /concerts/status?status=, GET /concerts/search?keyword=
 */
export const concertService = {
  getConcerts: (): Promise<AxiosResponse<APIResponse<Concert[]>>> =>
    axiosInstance.get<APIResponse<Concert[]>>('/concerts').then(res => {
      if (res.data?.result) {
        res.data.result = res.data.result.map(normalizeConcert);
      }
      return res;
    }),

  getConcertById: (id: string): Promise<AxiosResponse<APIResponse<Concert>>> =>
    axiosInstance.get<APIResponse<Concert>>(`/concerts/${id}`).then(res => {
      if (res.data?.result) {
        res.data.result = normalizeConcert(res.data.result);
      }
      return res;
    }),

  getConcertsByStatus: (status: string): Promise<AxiosResponse<APIResponse<Concert[]>>> =>
    axiosInstance.get<APIResponse<Concert[]>>(`/concerts/status?status=${status}`).then(res => {
      if (res.data?.result) {
        res.data.result = res.data.result.map(normalizeConcert);
      }
      return res;
    }),

  searchConcerts: (keyword: string): Promise<AxiosResponse<APIResponse<Concert[]>>> =>
    axiosInstance.get<APIResponse<Concert[]>>(`/concerts/search?keyword=${encodeURIComponent(keyword)}`).then(res => {
      if (res.data?.result) {
        res.data.result = res.data.result.map(normalizeConcert);
      }
      return res;
    }),

  createConcert: (data: ConcertCreateRequest): Promise<AxiosResponse<APIResponse<Concert>>> =>
    axiosInstance.post<APIResponse<Concert>>('/concerts', data),

  updateConcert: (id: string, data: ConcertCreateRequest): Promise<AxiosResponse<APIResponse<Concert>>> =>
    axiosInstance.put<APIResponse<Concert>>(`/concerts/${id}`, data),

  deleteConcert: (id: string): Promise<AxiosResponse<APIResponse<any>>> =>
    axiosInstance.delete<APIResponse<any>>(`/concerts/${id}`),
};

// Legacy category/genre stub — backend has no separate genre API
export const categoryService = {
  getCategories: () => Promise.resolve({ data: { result: [] } } as any),
  getGenres: () => Promise.resolve({ data: { result: [] } } as any),
  getAllGenres: () => Promise.resolve({ data: { result: [] } } as any),
};
