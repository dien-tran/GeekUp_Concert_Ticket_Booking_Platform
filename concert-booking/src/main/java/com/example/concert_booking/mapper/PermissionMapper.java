package com.example.concert_booking.mapper;

import com.example.concert_booking.dto.request.PermissionCreateRequest;
import com.example.concert_booking.dto.request.PermissionUpdateRequest;
import com.example.concert_booking.dto.response.PermissionResponse;
import com.example.concert_booking.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toEntity(PermissionCreateRequest request);
    PermissionResponse toResponse(Permission permission);

    void updateEntity(PermissionUpdateRequest request, @MappingTarget Permission permission);
}

