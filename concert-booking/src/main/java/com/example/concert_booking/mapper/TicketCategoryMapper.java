package com.example.concert_booking.mapper;

import com.example.concert_booking.dto.request.TicketCategoryRequest;
import com.example.concert_booking.dto.response.TicketCategoryResponse;
import com.example.concert_booking.entity.TicketCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TicketCategoryMapper {
    @Mapping(target = "concert", ignore = true)
    TicketCategory toTicketCategory(TicketCategoryRequest request);

    @Mapping(target = "concertId", source = "concert.id")
    @Mapping(target = "tickets", ignore = true)
    @Mapping(target = "availableQuantity", expression = "java(ticketCategory.getTotalQuantity() - (ticketCategory.getSoldQuantity() != null ? ticketCategory.getSoldQuantity() : 0))")
    TicketCategoryResponse toTicketCategoryResponse(TicketCategory ticketCategory);

    List<TicketCategoryResponse> toTicketCategoryResponses(List<TicketCategory> ticketCategories);
}
