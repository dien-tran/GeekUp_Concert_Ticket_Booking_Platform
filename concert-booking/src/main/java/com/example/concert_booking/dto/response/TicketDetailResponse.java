package com.example.concert_booking.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data  //@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketDetailResponse {
    private String id;
    private String seatNumber;
    private String type; // VIP, STANDARD
}
