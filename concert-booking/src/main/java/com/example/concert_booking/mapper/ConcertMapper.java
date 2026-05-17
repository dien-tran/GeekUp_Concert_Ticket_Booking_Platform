package com.example.concert_booking.mapper;

import com.example.concert_booking.dto.request.ConcertRequest;
import com.example.concert_booking.dto.response.ConcertResponse;
import com.example.concert_booking.entity.Concert;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConcertMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Concert toConcert(ConcertRequest request);

    ConcertResponse toConcertResponse(Concert concert);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateConcertFromRequest(ConcertRequest request, @MappingTarget Concert concert);

    List<ConcertResponse> toConcertResponseList(List<Concert> concerts);
}
