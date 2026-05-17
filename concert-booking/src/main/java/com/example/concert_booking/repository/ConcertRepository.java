package com.example.concert_booking.repository;

import com.example.concert_booking.entity.Concert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ConcertRepository extends JpaRepository<Concert, String> {
    List<Concert> findByStatus(String status);
    List<Concert> findByTitleContainingIgnoreCase(String keyword);
}
