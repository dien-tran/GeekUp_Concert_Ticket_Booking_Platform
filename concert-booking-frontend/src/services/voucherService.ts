import { AxiosResponse } from 'axios';
import { axiosInstance } from './api';
import { APIResponse, Voucher, VoucherRequest } from '../types';

/**
 * voucherService — voucher management.
 * Backend: GET /vouchers, GET /vouchers/{id},
 *          GET /vouchers/concerts/{concertId},
 *          POST /vouchers, PUT /vouchers/{id},
 *          POST /vouchers/validate
 */
export const voucherService = {
  getAllVouchers: (): Promise<AxiosResponse<APIResponse<Voucher[]>>> =>
    axiosInstance.get<APIResponse<Voucher[]>>('/vouchers'),

  getVoucherById: (id: string): Promise<AxiosResponse<APIResponse<Voucher>>> =>
    axiosInstance.get<APIResponse<Voucher>>(`/vouchers/${id}`),

  getVouchersByConcert: (concertId: string): Promise<AxiosResponse<APIResponse<Voucher[]>>> =>
    axiosInstance.get<APIResponse<Voucher[]>>(`/vouchers/concerts/${concertId}`),

  createVoucher: (data: VoucherRequest): Promise<AxiosResponse<APIResponse<Voucher>>> =>
    axiosInstance.post<APIResponse<Voucher>>('/vouchers', data),

  updateVoucher: (id: string, data: VoucherRequest): Promise<AxiosResponse<APIResponse<Voucher>>> =>
    axiosInstance.put<APIResponse<Voucher>>(`/vouchers/${id}`, data),

  validateVoucher: (code: string): Promise<AxiosResponse<APIResponse<Voucher>>> =>
    axiosInstance.post<APIResponse<Voucher>>('/vouchers/validate', { code }),
};
