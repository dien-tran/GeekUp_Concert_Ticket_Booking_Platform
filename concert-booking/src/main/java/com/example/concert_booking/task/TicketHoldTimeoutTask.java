package com.example.concert_booking.task;

import com.example.concert_booking.entity.Ticket;
import com.example.concert_booking.enums.TicketStatus;
import com.example.concert_booking.repository.TicketRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TicketHoldTimeoutTask {

    TicketRepository ticketRepository;

    @Scheduled(fixedRate = 30000) // Chạy mỗi 30 giây
    @Transactional
    public void releaseExpiredTicketHolds() {
        LocalDateTime now = LocalDateTime.now();
        
        // Tìm các vé đang ở trạng thái HOLD và có thời gian hết hạn trước thời điểm hiện tại
        List<Ticket> expiredTickets = ticketRepository.findByStatusAndHoldExpireTimeBefore(
                TicketStatus.HOLD.name(), now);

        if (expiredTickets.isEmpty()) {
            return;
        }

        for (Ticket ticket : expiredTickets) {
            ticket.setStatus(TicketStatus.AVAILABLE.name());
            ticket.setReserved(false);
            ticket.setHoldStartTime(null);
            ticket.setHoldExpireTime(null);
            ticket.setHeldByUser(null);
        }

        ticketRepository.saveAll(expiredTickets);
        log.info("Released {} expired ticket holds", expiredTickets.size());
    }
}
