package com.example.concert_booking.dto.response;

import com.example.concert_booking.enums.StatisticGroupBy;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReLocationStatisticsResponse {
    LocalDate fromDate;
    LocalDate toDate;
    String movieId;
    StatisticGroupBy groupBy;
    Long totalReLocation;
    Long totalBookings;
    Long totalTickets;
    List<ReLocationStatisticsItemResponse> items;
}

