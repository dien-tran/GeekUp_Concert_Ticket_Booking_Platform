package com.example.concert_booking.controller;

import com.example.concert_booking.dto.request.APIResponse;
import com.example.concert_booking.dto.request.VoucherRequest;
import com.example.concert_booking.dto.response.VoucherResponse;
import com.example.concert_booking.exception.AppException;
import com.example.concert_booking.exception.ErrorCode;
import com.example.concert_booking.repository.VoucherRepository;
import com.example.concert_booking.entity.Voucher;
import com.example.concert_booking.enums.VoucherStatus;
import com.example.concert_booking.mapper.VoucherMapper;
import com.example.concert_booking.service.VoucherService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherController {

    VoucherService voucherService;
    VoucherRepository voucherRepository;
    VoucherMapper voucherMapper;

    @PostMapping
    public APIResponse<VoucherResponse> createVoucher(@RequestBody VoucherRequest request) {
        return APIResponse.<VoucherResponse>builder()
                .result(voucherService.createVoucher(request))
                .build();
    }

    @GetMapping
    public APIResponse<List<VoucherResponse>> getAllVouchers() {
        return APIResponse.<List<VoucherResponse>>builder()
                .result(voucherService.getAllVouchers())
                .build();
    }

    @GetMapping("/{voucherId}")
    public APIResponse<VoucherResponse> getVoucherById(@PathVariable String voucherId) {
        return APIResponse.<VoucherResponse>builder()
                .result(voucherService.getVoucherById(voucherId))
                .build();
    }

    @PutMapping("/{voucherId}")
    public APIResponse<VoucherResponse> updateVoucher(@PathVariable String voucherId, @RequestBody VoucherRequest request) {
        return APIResponse.<VoucherResponse>builder()
                .result(voucherService.updateVoucher(voucherId, request))
                .build();
    }

    @GetMapping("/concerts/{concertId}")
    public APIResponse<List<VoucherResponse>> getVouchersByConcertId(@PathVariable String concertId) {
        return APIResponse.<List<VoucherResponse>>builder()
                .result(voucherService.getVouchersByConcertId(concertId))
                .build();
    }

    @PostMapping("/validate")
    public APIResponse<VoucherResponse> validateVoucher(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (voucher.getUsedQuantity() != null && voucher.getTotalQuantity() != null
                && voucher.getUsedQuantity() >= voucher.getTotalQuantity()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return APIResponse.<VoucherResponse>builder()
                .result(voucherMapper.toVoucherResponse(voucher))
                .build();
    }
}
