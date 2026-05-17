package com.example.concert_booking.controller;

import com.example.concert_booking.dto.request.APIResponse;
import com.example.concert_booking.dto.request.TicketCategoryRequest;
import com.example.concert_booking.dto.response.TicketCategoryResponse;
import com.example.concert_booking.service.TicketService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.concert_booking.dto.request.HoldTicketRequest;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketController {

    TicketService ticketService;

    @PostMapping
    public APIResponse<TicketCategoryResponse> createTicket(@Valid @RequestBody TicketCategoryRequest request) {
        return APIResponse.<TicketCategoryResponse>builder()
                .result(ticketService.createTicket(request))
                .build();
    }

    @GetMapping("/concerts/{concertId}")
    public APIResponse<List<TicketCategoryResponse>> getTicketsByConcertId(@PathVariable String concertId) {
        return APIResponse.<List<TicketCategoryResponse>>builder()
                .result(ticketService.getTicketsByConcertId(concertId))
                .build();
    }

    @GetMapping
    public APIResponse<List<TicketCategoryResponse>> getAllTickets() {
        return APIResponse.<List<TicketCategoryResponse>>builder()
                .result(ticketService.getAllTickets())
                .build();
    }

    @GetMapping("/{ticketId}")
    public APIResponse<TicketCategoryResponse> getTicketById(@PathVariable String ticketId) {
        return APIResponse.<TicketCategoryResponse>builder()
                .result(ticketService.getTicketById(ticketId))
                .build();
    }

    @PutMapping("/{ticketId}")
    public APIResponse<TicketCategoryResponse> updateTicket(@PathVariable String ticketId, @Valid @RequestBody TicketCategoryRequest request) {
        return APIResponse.<TicketCategoryResponse>builder()
                .result(ticketService.updateTicket(ticketId, request))
                .build();
    }

    @PostMapping("/hold")
    public APIResponse<Void> holdTickets(@Valid @RequestBody HoldTicketRequest request) {
        // Lấy userId từ SecurityContext nếu chưa có trong request
        if (request.getUserId() == null) {
            String name = SecurityContextHolder.getContext().getAuthentication().getName();
            // Ở đây giả sử name là userId hoặc bạn cần tìm user theo name
            // Để đơn giản tôi tạm thời yêu cầu truyền userId trong request hoặc bạn có thể xử lý map name -> id
        }

        ticketService.holdTickets(request);
        return APIResponse.<Void>builder()
                .message("Tickets held successfully")
                .build();
    }

    @PostMapping("/{ticketId}/generate-seats")
    public APIResponse<TicketCategoryResponse> generateSeats(@PathVariable String ticketId) {
        return APIResponse.<TicketCategoryResponse>builder()
                .result(ticketService.generateSeats(ticketId))
                .message("Seats generated successfully")
                .build();
    }
}
