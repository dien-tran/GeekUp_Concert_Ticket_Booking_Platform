package com.example.concert_booking.repository;

import com.example.concert_booking.entity.InvalidatedToken;
import com.example.concert_booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
