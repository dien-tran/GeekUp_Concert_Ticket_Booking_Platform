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
@Table(name = "ticket_categories")
public class TicketCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    Concert concert;

    String name;

    long price;

    @Column(name = "total_quantity")
    Integer totalQuantity;

    @Column(name = "sold_quantity")
    Integer soldQuantity;

    String status;

    @Version
    Long version;
}
