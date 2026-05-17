package com.example.concert_booking.repository;

import com.example.concert_booking.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, String> {
    boolean existsByVoucherIdAndUserId(String voucherId, String userId);
}
