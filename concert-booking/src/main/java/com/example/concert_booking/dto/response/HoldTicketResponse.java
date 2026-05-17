package com.example.concert_booking.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data  //@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoldTicketResponse {

    List<String> heldTicketIds;  // Danh sách ID vé đang hold
     String concertId;       // ID của buổi concert liên quan
     String userEmail;       // Email của user đang hold
     Integer holdDurationSeconds; // Thời gian hold còn lại
    Double totalPrice;         // Tổng giá tiền
}
