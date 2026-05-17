package com.example.concert_booking.enums;

public enum QrStatus
{
    NOT_CREATED, // Booking Pending
    PENDING, // Added for compatibility
    ACTIVE, // Booking Confirmed
    USED,   // QR used
    INVALID // Booking Cancel
}
