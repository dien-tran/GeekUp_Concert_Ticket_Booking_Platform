package com.example.concert_booking.repository;

import com.example.concert_booking.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findByConcertId(String concertId);
    List<Ticket> findByCategoryId(String categoryId);
    List<Ticket> findByCategoryIdOrderBySeatNumberAsc(String categoryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.concert.id = :concertId AND t.id IN :ids")
    List<Ticket> findByConcertIdAndIdInForUpdate(@Param("concertId") String concertId, @Param("ids") List<String> ids);

    @Query("SELECT t FROM Ticket t WHERE t.concert.id = :concertId AND t.id IN :ids")
    List<Ticket> findByConcertIdAndIdIn(@Param("concertId") String concertId, @Param("ids") List<String> ids);

    List<Ticket> findByStatusAndHoldExpireTimeBefore(String status, java.time.LocalDateTime now);
}
