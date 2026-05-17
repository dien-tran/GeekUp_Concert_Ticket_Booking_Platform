package com.example.concert_booking.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private String id;
    private String seatNumber;
    private boolean reserved;
    private String status;
}
