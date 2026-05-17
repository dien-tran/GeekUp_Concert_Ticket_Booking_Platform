package com.example.concert_booking.service;

import com.example.concert_booking.dto.request.RoleCreateRequest;
import com.example.concert_booking.dto.request.RoleUpdateRequest;
import com.example.concert_booking.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse create(RoleCreateRequest request);
    RoleResponse update(String name, RoleUpdateRequest request);
    void delete(String name);
    RoleResponse getByName(String name);
    List<RoleResponse> getAll();
}

