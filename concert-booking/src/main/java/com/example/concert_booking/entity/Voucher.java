package com.example.concert_booking.entity;

import com.example.concert_booking.enums.VoucherStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "voucher")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(unique = true)
    String code;

    @Column(name = "discount_value")
    BigDecimal discountValue;

    @Column(name = "total_quantity")
    Integer totalQuantity;

    @Column(name = "used_quantity")
    Integer usedQuantity;

    @Enumerated(EnumType.STRING)
    VoucherStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id")
    Concert concert;

    @Version
    Long version;
}
