package com.example.concert_booking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoldTicketRequest {
    @NotEmpty(message = "INVALID_REQUEST")
    List<@NotBlank(message = "NOT_NULL") String> ticketIds;

    @NotBlank(message = "NOT_NULL")
    String concertId;

    String userId;

    @NotNull(message = "NOT_NULL")
    @Min(value = 5, message = "INVALID_REQUEST")
    @Max(value = 5, message = "INVALID_REQUEST")
    Integer holdDuration; // in minutes
}
