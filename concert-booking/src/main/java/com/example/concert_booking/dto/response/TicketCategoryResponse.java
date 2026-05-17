package com.example.concert_booking.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCategoryResponse {
    private String id;
    private String concertId;
    private String name;
    private long price;
    private Integer totalQuantity;
    private Integer soldQuantity;
    private Integer availableQuantity;
    private String status;
    private List<TicketResponse> tickets; // Danh sách từng ghế trong hạng vé này
}
