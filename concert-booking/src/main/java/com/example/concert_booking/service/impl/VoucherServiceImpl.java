package com.example.concert_booking.service.impl;

import com.example.concert_booking.dto.request.VoucherRequest;
import com.example.concert_booking.dto.response.VoucherResponse;
import com.example.concert_booking.entity.Booking;
import com.example.concert_booking.entity.Concert;
import com.example.concert_booking.entity.User;
import com.example.concert_booking.entity.Voucher;
import com.example.concert_booking.entity.VoucherUsage;
import com.example.concert_booking.exception.AppException;
import com.example.concert_booking.exception.ErrorCode;
import com.example.concert_booking.mapper.VoucherMapper;
import com.example.concert_booking.repository.BookingRepository;
import com.example.concert_booking.repository.ConcertRepository;
import com.example.concert_booking.repository.UserRepository;
import com.example.concert_booking.repository.VoucherRepository;
import com.example.concert_booking.repository.VoucherUsageRepository;
import com.example.concert_booking.service.VoucherService;
import com.example.concert_booking.enums.VoucherStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherServiceImpl implements VoucherService {
    VoucherRepository voucherRepository;
    VoucherMapper voucherMapper;
    VoucherUsageRepository voucherUsageRepository;
    UserRepository userRepository;
    BookingRepository bookingRepository;
    ConcertRepository concertRepository;

    @Override
    public VoucherResponse createVoucher(VoucherRequest request) {
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new AppException(ErrorCode.INVALID_REQUEST); 
        }

        Voucher voucher = voucherMapper.toVoucher(request);
        
        if (request.getConcertId() != null) {
            Concert concert = concertRepository.findById(request.getConcertId())
                    .orElseThrow(() -> new AppException(ErrorCode.CONCERT_NOT_FOUND));
            voucher.setConcert(concert);
        }

        voucher.setUsedQuantity(0);
        if (request.getStatus() != null) {
            voucher.setStatus(VoucherStatus.valueOf(request.getStatus()));
        } else {
            voucher.setStatus(VoucherStatus.ACTIVE);
        }

        return voucherMapper.toVoucherResponse(voucherRepository.save(voucher));
    }

    @Override
    public List<VoucherResponse> getAllVouchers() {
        return voucherMapper.toVoucherResponseList(voucherRepository.findAll());
    }

    @Override
    public VoucherResponse getVoucherById(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));
        return voucherMapper.toVoucherResponse(voucher);
    }

    @Override
    public VoucherResponse updateVoucher(String id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        voucher.setCode(request.getCode());
        voucher.setDiscountValue(java.math.BigDecimal.valueOf(request.getDiscountValue()));
        voucher.setTotalQuantity(request.getUsageLimit());
        
        if (request.getConcertId() != null) {
            Concert concert = concertRepository.findById(request.getConcertId())
                    .orElseThrow(() -> new AppException(ErrorCode.CONCERT_NOT_FOUND));
            voucher.setConcert(concert);
        } else {
            voucher.setConcert(null);
        }

        if (request.getStatus() != null) {
            voucher.setStatus(VoucherStatus.valueOf(request.getStatus()));
        }
        
        return voucherMapper.toVoucherResponse(voucherRepository.save(voucher));
    }

    @Override
    public void updateVoucherStatus(String id, String status) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));
        voucher.setStatus(VoucherStatus.valueOf(status));
        voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    public void useVoucher(String voucherCode, String userId, String bookingId, java.math.BigDecimal discountAmount) {
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new AppException(ErrorCode.VOUCHER_INACTIVE);
        }

        // Kiểm tra số lượng trước khi sử dụng
        if (voucher.getUsedQuantity() >= voucher.getTotalQuantity()) {
            voucher.setStatus(VoucherStatus.OUT_OF_STOCK);
            voucherRepository.save(voucher);
            throw new AppException(ErrorCode.VOUCHER_OUT_OF_STOCK);
        }

        // Kiểm tra xem User đã sử dụng Voucher này chưa
        if (voucherUsageRepository.existsByVoucherIdAndUserId(voucher.getId(), userId)) {
            throw new AppException(ErrorCode.VOUCHER_ALREADY_USED); 
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Lưu bản ghi sử dụng voucher
        VoucherUsage usage = VoucherUsage.builder()
                .voucher(voucher)
                .user(user)
                .booking(booking)
                .usedAt(LocalDateTime.now())
                .discountAmount(discountAmount)
                .status("COMPLETED")
                .build();
        
        voucherUsageRepository.save(usage);

        voucher.setUsedQuantity(voucher.getUsedQuantity() + 1);
        if (voucher.getUsedQuantity() >= voucher.getTotalQuantity()) {
            voucher.setStatus(VoucherStatus.OUT_OF_STOCK);
        }
        voucherRepository.save(voucher);
    }

    @Override
    public List<VoucherResponse> getVouchersByConcertId(String concertId) {
        return voucherMapper.toVoucherResponseList(voucherRepository.findByConcertId(concertId));
    }
}
