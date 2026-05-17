package com.example.concert_booking.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    String bookingId;
    String userId;
    String concertId;
    LocalDateTime bookingTime;
    String status;
    long totalPrice;
    String qrToken;
    String qrStatus;
    Integer qrExpired;
    List<String> ticketIds;
    List<String> seatCodes;
}

