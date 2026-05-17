package com.example.concert_booking.service;

import com.example.concert_booking.dto.request.VoucherRequest;
import com.example.concert_booking.dto.response.VoucherResponse;

import java.util.List;

public interface VoucherService {
    VoucherResponse createVoucher(VoucherRequest request);
    List<VoucherResponse> getAllVouchers();
    VoucherResponse getVoucherById(String id);
    VoucherResponse updateVoucher(String id, VoucherRequest request);
    void updateVoucherStatus(String id, String status);
    void useVoucher(String voucherCode, String userId, String bookingId, java.math.BigDecimal discountAmount);
    List<VoucherResponse> getVouchersByConcertId(String concertId);
}
