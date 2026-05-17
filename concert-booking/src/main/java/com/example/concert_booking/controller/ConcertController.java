package com.example.concert_booking.controller;

import com.example.concert_booking.dto.request.APIResponse;
import com.example.concert_booking.dto.request.ConcertRequest;
import com.example.concert_booking.dto.response.ConcertResponse;
import com.example.concert_booking.dto.response.PageResponse;
import com.example.concert_booking.service.ConcertService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/concerts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConcertController {

    ConcertService concertService;

    @PostMapping
    public APIResponse<ConcertResponse> createConcert(@Valid @RequestBody ConcertRequest request) {
        log.info("createConcert");
        return APIResponse.<ConcertResponse>builder()
                .result(concertService.createConcert(request))
                .build();
    }

    @GetMapping
    public APIResponse<List<ConcertResponse>> getAllConcerts() {
        return APIResponse.<List<ConcertResponse>>builder()
                .result(concertService.getAllConcerts())
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<ConcertResponse> getConcertById(@PathVariable String id) {
        return APIResponse.<ConcertResponse>builder()
                .result(concertService.getConcertById(id))
                .build();
    }

    @PutMapping("/{id}")
    public APIResponse<ConcertResponse> updateConcert(@PathVariable String id, @Valid @RequestBody ConcertRequest request) {
        return APIResponse.<ConcertResponse>builder()
                .result(concertService.updateConcert(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public APIResponse<Void> deleteConcert(@PathVariable String id) {
        concertService.deleteConcert(id);
        return APIResponse.<Void>builder()
                .message("soft delete success")
                .build();
    }

    @GetMapping("/page")
    public APIResponse<PageResponse<ConcertResponse>> getConcerts(@RequestParam int page, @RequestParam int size) {
        return APIResponse.<PageResponse<ConcertResponse>>builder()
                .result(concertService.getConcerts(page, size))
                .build();
    }

    @GetMapping("/status")
    public APIResponse<List<ConcertResponse>> getConcertByStatus(@RequestParam String status) {
        return APIResponse.<List<ConcertResponse>>builder()
                .result(concertService.getConcertByStatus(status))
                .build();
    }

    @GetMapping("/search")
    public APIResponse<List<ConcertResponse>> searchConcerts(@RequestParam String keyword) {
        return APIResponse.<List<ConcertResponse>>builder()
                .result(concertService.searchConcerts(keyword))
                .build();
    }
}
