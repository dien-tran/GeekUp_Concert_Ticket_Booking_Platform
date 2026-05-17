package com.example.concert_booking.repository;

import com.example.concert_booking.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, String> {
    Optional<Voucher> findByCode(String code);
    boolean existsByCode(String code);
    java.util.List<Voucher> findByConcertId(String concertId);
}
