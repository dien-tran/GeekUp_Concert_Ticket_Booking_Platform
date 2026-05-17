package com.example.concert_booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {
    String id;
    String code;
    String concertId;
    String name;
    String description;
    String discountType;
    double discountValue;
    double minOrderAmount;
    double maxDiscountAmount;
    int usageLimit;
    int usedCount;
    int usageLimitPerUser;
    LocalDateTime startDate;
    LocalDateTime endDate;
    String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
