package com.example.concert_booking.service.impl;

import com.example.concert_booking.dto.request.HoldTicketRequest;
import com.example.concert_booking.dto.request.TicketCategoryRequest;
import com.example.concert_booking.dto.response.TicketCategoryResponse;
import com.example.concert_booking.entity.Concert;
import com.example.concert_booking.entity.Ticket;
import com.example.concert_booking.entity.TicketCategory;
import com.example.concert_booking.entity.User;
import com.example.concert_booking.enums.TicketStatus;
import com.example.concert_booking.exception.AppException;
import com.example.concert_booking.exception.ErrorCode;
import com.example.concert_booking.mapper.TicketCategoryMapper;
import com.example.concert_booking.repository.ConcertRepository;
import com.example.concert_booking.repository.TicketCategoryRepository;
import com.example.concert_booking.repository.TicketRepository;
import com.example.concert_booking.repository.UserRepository;
import com.example.concert_booking.service.TicketService;
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
public class TicketServiceImpl implements TicketService {
    TicketCategoryRepository ticketCategoryRepository;
    ConcertRepository concertRepository;
    TicketCategoryMapper ticketCategoryMapper;
    TicketRepository ticketRepository;
    UserRepository userRepository;

    @Override
    @Transactional
    public TicketCategoryResponse createTicket(TicketCategoryRequest request) {
        Concert concert = concertRepository.findById(request.getConcertId())
                .orElseThrow(() -> new AppException(ErrorCode.CONCERT_NOT_FOUND));

        TicketCategory ticketCategory = ticketCategoryMapper.toTicketCategory(request);
        ticketCategory.setConcert(concert);
        ticketCategory.setSoldQuantity(0);
        ticketCategory.setStatus("AVAILABLE");

        TicketCategory saved = ticketCategoryRepository.save(ticketCategory);

        // Auto-generate individual seat records for the seat map
        int total = saved.getTotalQuantity() != null ? saved.getTotalQuantity() : 0;
        String prefix = saved.getName().replaceAll("\\s+", "").toUpperCase();
        if (prefix.length() > 6) prefix = prefix.substring(0, 6);
        List<Ticket> seats = new java.util.ArrayList<>();
        for (int i = 1; i <= total; i++) {
            seats.add(Ticket.builder()
                    .concert(concert)
                    .category(saved)
                    .seatNumber(prefix + "-" + String.format("%03d", i))
                    .status(com.example.concert_booking.enums.TicketStatus.AVAILABLE.name())
                    .reserved(false)
                    .build());
        }
        ticketRepository.saveAll(seats);

        TicketCategoryResponse response = ticketCategoryMapper.toTicketCategoryResponse(saved);
        response.setTickets(seats.stream()
                .map(t -> com.example.concert_booking.dto.response.TicketResponse.builder()
                        .id(t.getId())
                        .seatNumber(t.getSeatNumber())
                        .reserved(t.isReserved())
                        .status(t.getStatus())
                        .build())
                .toList());
        return response;
    }

    @Override
    public List<TicketCategoryResponse> getTicketsByConcertId(String concertId) {
        List<TicketCategory> categories = ticketCategoryRepository.findByConcertId(concertId);
        return categories.stream().map(cat -> {
            TicketCategoryResponse response = ticketCategoryMapper.toTicketCategoryResponse(cat);
            List<Ticket> seats = ticketRepository.findByCategoryIdOrderBySeatNumberAsc(cat.getId());
            response.setTickets(seats.stream()
                    .map(t -> com.example.concert_booking.dto.response.TicketResponse.builder()
                            .id(t.getId())
                            .seatNumber(t.getSeatNumber())
                            .reserved(t.isReserved())
                            .status(t.getStatus())
                            .build())
                    .toList());
            return response;
        }).toList();
    }

    @Override
    public List<TicketCategoryResponse> getAllTickets() {
        return ticketCategoryMapper.toTicketCategoryResponses(ticketCategoryRepository.findAll());
    }

    @Override
    public TicketCategoryResponse getTicketById(String ticketId) {
        TicketCategory ticketCategory = ticketCategoryRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TICKET_ID));
        return ticketCategoryMapper.toTicketCategoryResponse(ticketCategory);
    }

    @Override
    public TicketCategoryResponse updateTicket(String ticketId, TicketCategoryRequest request) {
        TicketCategory ticketCategory = ticketCategoryRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TICKET_ID));

        ticketCategory.setName(request.getName());
        ticketCategory.setPrice(request.getPrice().longValue());
        ticketCategory.setTotalQuantity(request.getTotalQuantity());
        if (request.getStatus() != null) {
            ticketCategory.setStatus(request.getStatus());
        }

        return ticketCategoryMapper.toTicketCategoryResponse(ticketCategoryRepository.save(ticketCategory));
    }

    @Override
    public void updateTicketStatus(String ticketId, String status) {
        TicketCategory ticketCategory = ticketCategoryRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TICKET_ID));
        ticketCategory.setStatus(status);
        ticketCategoryRepository.save(ticketCategory);
    }

    @Override
    @Transactional
    public void holdTickets(HoldTicketRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Ticket> tickets = ticketRepository.findByConcertIdAndIdInForUpdate(request.getConcertId(), request.getTicketIds());
        
        if (tickets.size() != request.getTicketIds().size()) {
            throw new AppException(ErrorCode.INVALID_TICKET_IDS);
        }

        LocalDateTime now = LocalDateTime.now();
        for (Ticket ticket : tickets) {
            // Kiểm tra nếu vé đang được giữ bởi người khác và chưa hết hạn
            if (ticket.getStatus() != null && ticket.getStatus().equals(TicketStatus.HOLD.name())) {
                if (ticket.getHoldExpireTime() != null && ticket.getHoldExpireTime().isAfter(now)) {
                    if (ticket.getHeldByUser() != null && !ticket.getHeldByUser().getId().equals(user.getId())) {
                        throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
                    }
                }
            }
            
            if (ticket.getStatus() != null && ticket.getStatus().equals(TicketStatus.BOOKED.name())) {
                throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
            }

            ticket.setStatus(TicketStatus.HOLD.name());
            ticket.setHeldByUser(user);
            ticket.setHoldStartTime(now);
            ticket.setHoldExpireTime(now.plusMinutes(request.getHoldDuration()));
        }

        ticketRepository.saveAll(tickets);
    }

    @Override
    @Transactional
    public TicketCategoryResponse generateSeats(String categoryId) {
        TicketCategory cat = ticketCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TICKET_ID));

        // Only generate if no seats exist yet
        List<Ticket> existing = ticketRepository.findByCategoryIdOrderBySeatNumberAsc(categoryId);
        if (existing.isEmpty()) {
            int total = cat.getTotalQuantity() != null ? cat.getTotalQuantity() : 0;
            String prefix = cat.getName().replaceAll("\\s+", "").toUpperCase();
            if (prefix.length() > 6) prefix = prefix.substring(0, 6);
            List<Ticket> seats = new java.util.ArrayList<>();
            for (int i = 1; i <= total; i++) {
                seats.add(Ticket.builder()
                        .concert(cat.getConcert())
                        .category(cat)
                        .seatNumber(prefix + "-" + String.format("%03d", i))
                        .status(TicketStatus.AVAILABLE.name())
                        .reserved(false)
                        .build());
            }
            ticketRepository.saveAll(seats);
            existing = seats;
        }

        TicketCategoryResponse response = ticketCategoryMapper.toTicketCategoryResponse(cat);
        response.setTickets(existing.stream()
                .map(t -> com.example.concert_booking.dto.response.TicketResponse.builder()
                        .id(t.getId())
                        .seatNumber(t.getSeatNumber())
                        .reserved(t.isReserved())
                        .status(t.getStatus())
                        .build())
                .toList());
        return response;
    }
}
