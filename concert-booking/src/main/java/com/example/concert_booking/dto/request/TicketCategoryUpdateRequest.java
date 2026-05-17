package com.example.concert_booking.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCategoryUpdateRequest {
    @NotBlank(message = "NOT_NULL")
    String name;

    @NotNull
    @DecimalMin(value = "1.0", message = "INVALID_REQUEST")
    Double price;
}
