package com.example.concert_booking.dto.request;

import com.example.concert_booking.enums.StatisticGroupBy;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReLocationStatisticsRequest {
    LocalDate fromDate;
    LocalDate toDate;
    String movieId;
    StatisticGroupBy groupBy;
}

