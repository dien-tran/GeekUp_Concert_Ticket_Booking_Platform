package com.example.concert_booking.service;

import com.example.concert_booking.dto.request.TicketCategoryRequest;
import com.example.concert_booking.dto.request.HoldTicketRequest;
import com.example.concert_booking.dto.response.TicketCategoryResponse;
import java.util.List;

public interface TicketService {
    TicketCategoryResponse createTicket(TicketCategoryRequest request);
    List<TicketCategoryResponse> getTicketsByConcertId(String concertId);
    TicketCategoryResponse getTicketById(String ticketId);
    TicketCategoryResponse updateTicket(String ticketId, TicketCategoryRequest request);
    List<TicketCategoryResponse> getAllTickets();
    void updateTicketStatus(String ticketId, String status);

    void holdTickets(HoldTicketRequest request);
    TicketCategoryResponse generateSeats(String categoryId);
}
