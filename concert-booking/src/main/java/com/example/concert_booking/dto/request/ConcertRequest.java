package com.example.concert_booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ConcertRequest {

    @NotBlank(message = "NOT_NULL")
    String title;

    String description;

    @NotNull(message = "NOT_NULL")
    @Min(value = 1, message = "INVALID_REQUEST")
    Integer duration;

    String status;

    String posterUrl;

    LocalDate openDate;

    LocalDateTime startTime;
}
