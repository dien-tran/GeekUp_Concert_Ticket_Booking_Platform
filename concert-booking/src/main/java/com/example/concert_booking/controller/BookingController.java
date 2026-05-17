package com.example.concert_booking.controller;

import com.example.concert_booking.dto.request.APIResponse;
import com.example.concert_booking.dto.request.BookingRequest;
import com.example.concert_booking.dto.request.ScanRequest;
import com.example.concert_booking.dto.response.BookingResponse;
import com.example.concert_booking.service.BookingService;
import com.example.concert_booking.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {
    BookingService bookingService;

    @PostMapping
    public APIResponse<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        // Force userId from authenticated JWT (prevents spoofing)
        request.setUserId(SecurityUtils.getCurrentUserId());

        return APIResponse.<BookingResponse>builder()
                .result(bookingService.createBooking(request))
                .build();
    }

    @DeleteMapping("/{bookingId}")
    public APIResponse<Void> cancelBooking(@PathVariable String bookingId) {
        bookingService.cancelBooking(bookingId);
        return APIResponse.<Void>builder()
                .message("Booking cancelled")
                .build();
    }

    @PatchMapping("/{bookingId}/confirm")
    public APIResponse<Void> confirmBooking(@PathVariable String bookingId) {
        bookingService.confirmBooking(bookingId);
        return APIResponse.<Void>builder()
                .message("Booking confirmed")
                .build();
    }

    @GetMapping("/me")
    public APIResponse<List<BookingResponse>> getMyBookings() {
        return APIResponse.<List<BookingResponse>>builder()
                .result(bookingService.getBookingsByUser(SecurityUtils.getCurrentUserId()))
                .build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<List<BookingResponse>> getBookingsByUser(@PathVariable String userId) {
        return APIResponse.<List<BookingResponse>>builder()
                .result(bookingService.getBookingsByUser(userId))
                .build();
    }
    
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<List<BookingResponse>> getAllBookingsForAdmin() {
        return APIResponse.<List<BookingResponse>>builder()
                .result(bookingService.getAllBookingsForAdmin())
                .build();
    }

    @DeleteMapping("/{bookingId}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> hardDeleteBooking(@PathVariable String bookingId) {
        bookingService.deleteBooking(bookingId);
        return APIResponse.<Void>builder()
                .message("Booking hard deleted successfully")
                .build();
    }

    @PostMapping ("/scanQr")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public APIResponse<Void> scanQr(@Valid @RequestBody ScanRequest qrToken) {
        return APIResponse.<Void>builder()
                .result(bookingService.scanQr(qrToken.getToken()))
                .message("QR scanned successfully")
                .build();
    }
}
