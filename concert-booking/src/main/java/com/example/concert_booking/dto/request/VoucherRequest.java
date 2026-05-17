package com.example.concert_booking.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherRequest {
    String code;
    String concertId;
    String name;
    String description;
    String discountType; // PERCENTAGE, FIXED_AMOUNT
    double discountValue;
    double minOrderAmount;
    double maxDiscountAmount;
    int usageLimit;
    int usageLimitPerUser;
    LocalDateTime startDate;
    LocalDateTime endDate;
    String status;
}
