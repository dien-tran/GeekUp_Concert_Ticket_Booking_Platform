package com.example.concert_booking.service.impl;

import com.example.concert_booking.dto.request.ConcertRequest;
import com.example.concert_booking.dto.response.ConcertResponse;
import com.example.concert_booking.dto.response.PageResponse;
import com.example.concert_booking.entity.Concert;
import com.example.concert_booking.exception.AppException;
import com.example.concert_booking.exception.ErrorCode;
import com.example.concert_booking.mapper.ConcertMapper;
import com.example.concert_booking.repository.ConcertRepository;
import com.example.concert_booking.service.ConcertService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConcertServiceImpl implements ConcertService {

    ConcertRepository concertRepository;
    ConcertMapper concertMapper;

    @Override
    public ConcertResponse createConcert(ConcertRequest request) {
        Concert concert = concertMapper.toConcert(request);
        concert = concertRepository.save(concert);
        return concertMapper.toConcertResponse(concert);
    }

    @Override
    public List<ConcertResponse> getAllConcerts() {
        return concertRepository.findAll().stream()
                .map(concertMapper::toConcertResponse)
                .toList();
    }

    @Override
    public ConcertResponse getConcertById(String id) {
        Concert concert = concertRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONCERT_NOT_FOUND));
        return concertMapper.toConcertResponse(concert);
    }

    @Override
    public ConcertResponse updateConcert(String id, ConcertRequest request) {
        Concert concert = concertRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONCERT_NOT_FOUND));

        concertMapper.updateConcertFromRequest(request, concert);
        concert = concertRepository.save(concert);
        return concertMapper.toConcertResponse(concert);
    }

    @Override
    public void deleteConcert(String id) {
        if (!concertRepository.existsById(id)) {
            throw new AppException(ErrorCode.CONCERT_NOT_FOUND);
        }
        concertRepository.deleteById(id);
    }

    @Override
    public PageResponse<ConcertResponse> getConcerts(int page, int size) {
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<Concert> pageData = concertRepository.findAll(pageable);

        return PageResponse.<ConcertResponse>builder()
                .page(page)
                .size(size)
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .content(pageData.getContent().stream().map(concertMapper::toConcertResponse).toList())
                .build();
    }

    @Override
    public List<ConcertResponse> getConcertByStatus(String status) {
        return concertRepository.findByStatus(status).stream()
                .map(concertMapper::toConcertResponse)
                .toList();
    }

    @Override
    public List<ConcertResponse> searchConcerts(String keyword) {
        return concertRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(concertMapper::toConcertResponse)
                .toList();
    }
}
