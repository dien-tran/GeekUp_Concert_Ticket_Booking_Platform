package com.example.concert_booking.repository;

import com.example.concert_booking.entity.TicketCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCategoryRepository extends JpaRepository<TicketCategory, String> {
    List<TicketCategory> findByConcertId(String concertId);
}
