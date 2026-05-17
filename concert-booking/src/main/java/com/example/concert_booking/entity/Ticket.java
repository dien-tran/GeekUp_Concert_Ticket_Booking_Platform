package com.example.concert_booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    Concert concert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    TicketCategory category;

    String seatNumber; // Ví dụ: A1, A2, B1...

    @Column(name = "is_reserved")
    boolean reserved;

    String status; // AVAILABLE, HOLD, SOLD

    java.time.LocalDateTime holdStartTime;
    java.time.LocalDateTime holdExpireTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "held_by_user_id")
    User heldByUser;

    public long getPrice() {
        return category != null ? category.getPrice() : 0L;
    }
}
