package com.example.concert_booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCategoryRequest {
    @NotBlank(message = "NOT_NULL")
    String concertId;

    @NotBlank(message = "NOT_NULL")
    String name;

    @NotNull(message = "NOT_NULL")
    @Min(value = 0, message = "INVALID_PRICE")
    Long price;

    @NotNull(message = "NOT_NULL")
    @Min(value = 1, message = "INVALID_QUANTITY")
    Integer totalQuantity;

    String status;
}
