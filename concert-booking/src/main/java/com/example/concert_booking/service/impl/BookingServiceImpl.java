package com.example.concert_booking.service.impl;

import com.example.concert_booking.dto.request.BookingRequest;
import com.example.concert_booking.dto.response.BookingResponse;
import com.example.concert_booking.entity.Booking;
import com.example.concert_booking.entity.BookingItem;
import com.example.concert_booking.entity.Concert;
import com.example.concert_booking.entity.Ticket;
import com.example.concert_booking.entity.User;
import com.example.concert_booking.enums.BookingStatus;
import com.example.concert_booking.enums.QrStatus;
import com.example.concert_booking.enums.TicketStatus;
import com.example.concert_booking.exception.AppException;
import com.example.concert_booking.exception.ErrorCode;
import com.example.concert_booking.repository.BookingRepository;
import com.example.concert_booking.repository.ConcertRepository;
import com.example.concert_booking.repository.TicketRepository;
import com.example.concert_booking.repository.TicketCategoryRepository;
import com.example.concert_booking.repository.UserRepository;
import com.example.concert_booking.repository.BookingItemRepository;
import com.example.concert_booking.constants.BookingConstants;
import com.example.concert_booking.service.BookingService;
import com.example.concert_booking.service.VoucherService;
import com.example.concert_booking.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import java.security.SecureRandom;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class BookingServiceImpl implements BookingService {
    BookingRepository bookingRepository;
    BookingItemRepository bookingItemRepository;
    ConcertRepository concertRepository;
    UserRepository userRepository;
    TicketRepository ticketRepository;
    TicketCategoryRepository ticketCategoryRepository;
    VoucherService voucherService;
    VoucherRepository voucherRepository;


    @NonFinal
    @Value("${qr.scan-early-minutes:30}")
    protected int QR_SCAN_EARLY_MINUTES;

    private static final String TICKET_CODE_PREFIX = "TCK_";
    private static final int TICKET_CODE_LENGTH = 20;
    private static final String TICKET_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest bookingRequest) {
        if (bookingRequest.getTicketIds() == null || bookingRequest.getTicketIds().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_TICKET_IDS);
        }

        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Concert concert = concertRepository.findById(bookingRequest.getConcertId())
                .orElseThrow(() -> new AppException(ErrorCode.CONCERT_NOT_EXISTED));

        List<Ticket> tickets = ticketRepository.findAllById(bookingRequest.getTicketIds());
        if (tickets.size() != bookingRequest.getTicketIds().size()) {
            throw new AppException(ErrorCode.INVALID_TICKET_IDS);
        }

        for (Ticket ticket : tickets) {
            if (!ticket.getConcert().getId().equals(concert.getId())) {
                throw new AppException(ErrorCode.INVALID_TICKET_IDS);
            }
        }

        LocalDateTime now = LocalDateTime.now();
        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == null || !ticket.getStatus().equals(TicketStatus.HOLD.name())) {
                throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
            }
            if (ticket.getHoldExpireTime() == null || ticket.getHoldExpireTime().isBefore(now)) {
                throw new AppException(ErrorCode.HOLD_EXPIRED);
            }
            if (ticket.getHeldByUser() == null || !ticket.getHeldByUser().getId().equals(user.getId())) {
                throw new AppException(ErrorCode.TICKET_HOLD_USER_MISMATCH);
            }
        }

        long totalPrice = tickets.stream()
                .mapToLong(Ticket::getPrice)
                .sum();

        // Apply Voucher if provided and update totalPrice
        java.math.BigDecimal discountAmount = java.math.BigDecimal.ZERO;
        if (bookingRequest.getVoucherCode() != null && !bookingRequest.getVoucherCode().isBlank()) {
            com.example.concert_booking.entity.Voucher voucher = voucherRepository.findByCode(bookingRequest.getVoucherCode())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));
            
            discountAmount = voucher.getDiscountValue();
            // Trừ tiền: totalPrice - discountAmount (đảm bảo không âm)
            totalPrice = Math.max(0, totalPrice - discountAmount.longValue());
        }

        Booking booking = Booking.builder()
                .user(user)
                .concert(concert)
                .totalPrice(totalPrice)
                .bookingTime(LocalDateTime.now())
                .status(BookingStatus.PENDING)
                .qrStatus(QrStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        if (bookingRequest.getVoucherCode() != null && !bookingRequest.getVoucherCode().isBlank()) {
            voucherService.useVoucher(bookingRequest.getVoucherCode(), user.getId(), savedBooking.getId(), discountAmount);
            
            log.info("Applied voucher {}: User ID = {}, Booking ID = {}, Discount = {}", 
                    bookingRequest.getVoucherCode(), user.getId(), savedBooking.getId(), discountAmount);
        }

        for (Ticket ticket : tickets) {
            BookingItem bookingItem = BookingItem.builder()
                    .booking(savedBooking)
                    .ticket(ticket)
                    .build();

            // Keep hold metadata intact until payment callback confirms the booking.
            // Clearing holdExpireTime/heldByUser here causes payment confirmation to fail.
            ticket.setStatus(TicketStatus.HOLD.name());
            ticketRepository.save(ticket);
            bookingItemRepository.save(bookingItem);
            savedBooking.getBookingItems().add(bookingItem);
        }


        return toResponse(savedBooking, tickets);
    }

    @Override
    @Transactional
    public void cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CONFIRMED);
        }

        List<BookingItem> bookingItems = bookingItemRepository.findByBooking(booking);
        List<String> ticketIds = bookingItems.stream()
                .map(bs -> bs.getTicket().getId())
                .toList();

        if (!ticketIds.isEmpty()) {
            List<Ticket> tickets = ticketRepository.findByConcertIdAndIdInForUpdate(
                    booking.getConcert().getId(),
                    ticketIds
            );
            for (Ticket ticket : tickets) {
                ticket.setStatus(TicketStatus.AVAILABLE.name());
                ticket.setReserved(false);
                ticket.setHoldStartTime(null);
                ticket.setHoldExpireTime(null);
                ticket.setHeldByUser(null);
            }
            ticketRepository.saveAll(tickets);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setQrStatus(QrStatus.INVALID);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public void confirmBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CONFIRMED);
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_NOT_PENDING);
        }

        List<BookingItem> bookingItems = bookingItemRepository.findByBooking(booking);
        List<String> ticketIds = bookingItems.stream()
                .map(bs -> bs.getTicket().getId())
                .toList();

        if (ticketIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_TICKET_IDS);
        }

        List<Ticket> tickets = ticketRepository.findByConcertIdAndIdInForUpdate(
                booking.getConcert().getId(),
                ticketIds
        );

        if (tickets.size() != ticketIds.size()) {
            throw new AppException(ErrorCode.INVALID_TICKET_IDS);
        }

        LocalDateTime now = LocalDateTime.now();
        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == null || !ticket.getStatus().equals(TicketStatus.HOLD.name())) {
                throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
            }
            if (ticket.getHoldExpireTime() == null || ticket.getHoldExpireTime().isBefore(now)) {
                throw new AppException(ErrorCode.HOLD_EXPIRED);
            }
            if (ticket.getHeldByUser() == null || !ticket.getHeldByUser().getId().equals(booking.getUser().getId())) {
                throw new AppException(ErrorCode.TICKET_HOLD_USER_MISMATCH);
            }
        }

        // Count tickets per category to update sold_quantity in batches
        Map<String, Long> categoryCount = tickets.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(t -> t.getCategory().getId(), Collectors.counting()));

        for (Ticket ticket : tickets) {
            ticket.setStatus(TicketStatus.BOOKED.name());
            ticket.setHoldStartTime(null);
            ticket.setHoldExpireTime(null);
            ticket.setHeldByUser(null);
        }
        ticketRepository.saveAll(tickets);

        // Update sold_quantity once per category based on the booking size
        categoryCount.forEach((categoryId, count) -> {
            ticketCategoryRepository.findById(categoryId).ifPresent(category -> {
                int currentSold = category.getSoldQuantity() != null ? category.getSoldQuantity() : 0;
                category.setSoldQuantity(currentSold + count.intValue());
                ticketCategoryRepository.save(category);
                log.info("Updated TicketCategory {}: Added {} to sold_quantity", category.getName(), count);
            });
        });

        booking.setStatus(BookingStatus.CONFIRMED);
        // Lưu số phút hiệu lực QR code (duration của buổi hòa nhạc)
        int durationMinutes = booking.getConcert().getDuration();
        booking.setQrExpired(durationMinutes);
        booking.setQrStatus(QrStatus.ACTIVE);
        booking.setQrToken(generateShortTicketCode());
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public List<BookingResponse> getBookingsByUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Booking> bookings = bookingRepository.findByUserOrderByBookingTimeDesc(user);
        return bookings.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookingsForAdmin() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private BookingResponse toResponse(Booking booking) {
        List<BookingItem> bookingItems = bookingItemRepository.findByBookingId(booking.getId());
        List<String> ticketIds = bookingItems.stream()
                .map(bs -> bs.getTicket().getId())
                .toList();

        List<Ticket> tickets = ticketIds.isEmpty()
                ? List.of()
                : ticketRepository.findByConcertIdAndIdIn(
                booking.getConcert().getId(),
                ticketIds
        );
        return toResponse(booking, tickets);
    }

    private BookingResponse toResponse(Booking booking, List<Ticket> tickets) {
        List<String> ticketIds = tickets.stream()
                .map(Ticket::getId)
                .toList();

        List<String> seatCodes = tickets.stream()
                .map(Ticket::getSeatNumber)
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .userId(booking.getUser().getId())
                .concertId(booking.getConcert().getId())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus().name())
                .totalPrice(booking.getTotalPrice())
                .qrToken(booking.getQrToken())
                .qrStatus(booking.getQrStatus() != null ? booking.getQrStatus().name() : null)
                .qrExpired(booking.getQrExpired())
                .ticketIds(ticketIds)
                .seatCodes(seatCodes)
                .build();
    }

    private String generateShortTicketCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder code = new StringBuilder(TICKET_CODE_PREFIX);
            for (int i = 0; i < TICKET_CODE_LENGTH; i++) {
                code.append(TICKET_ALPHABET.charAt(SECURE_RANDOM.nextInt(TICKET_ALPHABET.length())));
            }
            String ticketCode = code.toString();
            if (!bookingRepository.existsByQrToken(ticketCode)) {
                return ticketCode;
            }
        }
        throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Transactional
    public Void scanQr(String token) {
        if (token == null || token.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Booking booking = bookingRepository.findByQrToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.QR_TOKEN_INVALID));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_INVALID_FOR_SCAN);
        }

        if (booking.getQrStatus() != QrStatus.ACTIVE) {
            throw new AppException(ErrorCode.QR_USED);
        }

        LocalDateTime startTime = booking.getConcert().getStartTime();
        int validMinutes = booking.getQrExpired() != null
                ? booking.getQrExpired()
                : booking.getConcert().getDuration();
        LocalDateTime scanStartTime = startTime.minusMinutes(BookingConstants.QR_SCAN_EARLY_MINUTES);
        LocalDateTime expireTime = startTime.plusMinutes(validMinutes);
        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(scanStartTime)) {
            throw new AppException(ErrorCode.BOOKING_INVALID_FOR_SCAN);
        }
        if (now.isAfter(expireTime)) {
            throw new AppException(ErrorCode.QR_TOKEN_EXPIRED);
        }

        // update
        booking.setQrStatus(QrStatus.USED);
        bookingRepository.save(booking);

        return null;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() != BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_NOT_CANCELLED);
        }

        bookingItemRepository.deleteByBooking(booking);
        bookingRepository.delete(booking);
    }
}
