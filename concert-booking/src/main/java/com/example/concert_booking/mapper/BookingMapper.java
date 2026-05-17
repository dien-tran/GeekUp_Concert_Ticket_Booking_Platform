package com.example.concert_booking.mapper;

import com.example.concert_booking.dto.request.BookingRequest;
import com.example.concert_booking.entity.Booking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    Booking toBooking(BookingRequest request);
}
