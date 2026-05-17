package com.example.concert_booking.service;

import com.example.concert_booking.dto.request.ReLocationStatisticsRequest;
import com.example.concert_booking.dto.response.ReLocationStatisticsResponse;



public interface StatisticService {
    ReLocationStatisticsResponse getReLocationStatistics(ReLocationStatisticsRequest request);
}
