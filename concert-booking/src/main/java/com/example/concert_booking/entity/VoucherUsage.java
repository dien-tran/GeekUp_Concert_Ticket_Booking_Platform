package com.example.concert_booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "voucher_usage", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"voucher_id", "booking_id"}),
        @UniqueConstraint(columnNames = {"voucher_id", "user_id"})
})
public class VoucherUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    Voucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    String status;

    @Column(name = "used_at")
    LocalDateTime usedAt;

    @Column(name = "discount_amount")
    BigDecimal discountAmount;
}
