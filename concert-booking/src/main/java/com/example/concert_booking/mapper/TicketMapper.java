package com.example.concert_booking.mapper;

import com.example.concert_booking.dto.response.TicketDetailResponse;
import com.example.concert_booking.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TicketMapper {

    TicketDetailResponse toTicketDetailResponse(Ticket ticket);

    List<TicketDetailResponse> toTicketDetailResponses(List<Ticket> tickets);
}
