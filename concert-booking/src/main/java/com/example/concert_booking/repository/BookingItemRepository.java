package com.example.concert_booking.repository;

import com.example.concert_booking.entity.Booking;
import com.example.concert_booking.entity.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingItemRepository extends JpaRepository<BookingItem, String> {
    List<BookingItem> findByBooking(Booking booking);
    List<BookingItem> findByBookingId(String bookingId);
    void deleteByBooking(Booking booking);
}
