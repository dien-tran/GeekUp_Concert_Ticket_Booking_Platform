package com.example.concert_booking.service;

import com.example.concert_booking.dto.request.ConcertRequest;
import com.example.concert_booking.dto.response.ConcertResponse;
import com.example.concert_booking.dto.response.PageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ConcertService {
    ConcertResponse createConcert(ConcertRequest request);
    List<ConcertResponse> getAllConcerts();
    ConcertResponse getConcertById(String id);
    ConcertResponse updateConcert(String id, ConcertRequest request);
    void deleteConcert(String id);
    PageResponse<ConcertResponse> getConcerts(int page, int size);
    List<ConcertResponse> getConcertByStatus(String status);
    List<ConcertResponse> searchConcerts(String keyword);
}
