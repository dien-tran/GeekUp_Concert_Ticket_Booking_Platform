package com.example.concert_booking.mapper;

import com.example.concert_booking.dto.request.*;
import com.example.concert_booking.dto.response.UserResponse;
import com.example.concert_booking.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")

public interface UserMapper {
    User toUser(UserRegisterRequest request);
    UserResponse toUserResponse(User user);

    @Mapping(target = "role", ignore = true)
    @Mapping(target = "password", ignore = true)
    void updateUserFromRequest(UserUpdateRequest request, @MappingTarget User user);

    void updateUserStatusFromRequest(UserUpdateStatusRequest request, @MappingTarget User user);
    void assignUserRoleFromRequest(UserAssignRoleRequest request, @MappingTarget User user);
}
