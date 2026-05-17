package com.example.concert_booking.repository;

import com.example.concert_booking.entity.Booking;
import com.example.concert_booking.entity.Concert;
import com.example.concert_booking.entity.User;
import com.example.concert_booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserOrderByBookingTimeDesc(User user);

    Optional<Booking> findByQrToken(String qrToken);

    Optional<Booking> findById(String id); // Already provided by JpaRepository, but we can be explicit if needed or mapping calls findByBookingId

    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByBookingId(@Param("id") String id);

    boolean existsByQrToken(String qrToken);

    List<Booking> findByStatusAndBookingTimeBefore(BookingStatus status, LocalDateTime cutoff);

    @Query("""
            SELECT DISTINCT b
            FROM Booking b
            JOIN FETCH b.concert c
            WHERE b.status = :status
              AND b.bookingTime >= :fromDateTime
              AND b.bookingTime < :toDateTime
              AND (:concertId IS NULL OR c.id = :concertId)
            ORDER BY b.bookingTime ASC
            """)
    List<Booking> findForReLocationStatistics(@Param("status") BookingStatus status,
                                           @Param("fromDateTime") LocalDateTime fromDateTime,
                                           @Param("toDateTime") LocalDateTime toDateTime,
                                           @Param("concertId") String concertId);

    long countByConcertAndStatusIn(Concert concert, List<BookingStatus> pending);
}
