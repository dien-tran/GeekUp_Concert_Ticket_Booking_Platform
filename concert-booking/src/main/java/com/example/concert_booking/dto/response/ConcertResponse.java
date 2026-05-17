package com.example.concert_booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConcertResponse {
    String id;
    String title;
    String description;
    Integer duration;
    String status;
    String posterUrl;
    LocalDate openDate;
    LocalDateTime startTime;
}
