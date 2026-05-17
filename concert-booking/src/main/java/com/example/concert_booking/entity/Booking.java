package com.example.concert_booking.entity;

import com.example.concert_booking.enums.BookingStatus;
import com.example.concert_booking.enums.QrStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "total_price")
    long totalPrice;

    LocalDateTime bookingTime;    @Enumerated(EnumType.STRING)
    BookingStatus status;

    @Column(name = "idempotency_key", unique = true)
    String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    Concert concert;

    @JsonIgnore
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @Builder.Default
    List<BookingItem> bookingItems = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @Builder.Default
    List<Payment> payments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @Builder.Default
    List<VoucherUsage> voucherUsages = new ArrayList<>();

    @Version
    Long version;

    @Column(columnDefinition = "TEXT")
    String qrToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    QrStatus qrStatus;

    Integer qrExpired; // Số phút hiệu lực QR code
}
