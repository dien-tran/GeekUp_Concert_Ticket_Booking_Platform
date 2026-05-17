package com.example.concert_booking.mapper;


import com.example.concert_booking.dto.request.RoleCreateRequest;
import com.example.concert_booking.dto.response.RoleResponse;
import com.example.concert_booking.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toEntity(RoleCreateRequest roleCreateRequest);

    RoleResponse toResponse(Role role);
}
