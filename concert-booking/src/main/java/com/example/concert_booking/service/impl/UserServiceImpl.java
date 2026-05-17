package com.example.concert_booking.service.impl;

import com.example.concert_booking.dto.request.*;
import com.example.concert_booking.dto.response.UserResponse;
import com.example.concert_booking.entity.Role;
import com.example.concert_booking.entity.User;
import com.example.concert_booking.exception.AppException;
import com.example.concert_booking.exception.ErrorCode;
import com.example.concert_booking.mapper.UserMapper;
import com.example.concert_booking.repository.RoleRepository;
import com.example.concert_booking.repository.UserRepository;
import com.example.concert_booking.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor // tự động tạo constructor cho tất cả các field final
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) // tự động set tất cả các field là private và final
@Slf4j
public class UserServiceImpl  implements UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;

    public UserResponse createUser(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) throw new AppException(ErrorCode.USER_EMAIL_EXISTED);

        User user = userMapper.toUser(request);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        String roleName = com.example.concert_booking.enums.Role.USER.name();
        Role role = roleRepository.findById(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(roleName)
                        .description("User role")
                        .build()));

        user.setRole(role);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse getMyInfo()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }
//"returnObject.email == authentication.name or
    @PostAuthorize("hasRole('ADMIN_Read')")
    @Override
    public UserResponse updateUser(UserUpdateRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUserFromRequest(request, user);

        if (StringUtils.hasText(request.getPassword())) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // vì mapper không thể tự convert string sang object Role nên phải convert thủ công ở đây
        // vì request là dạng string nên phải convert sang object Role

        if (StringUtils.hasText(request.getRole())) {
            Role role = roleRepository.findById(request.getRole())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
            user.setRole(role);
        }

        userRepository.save(user);

        return userMapper.toUserResponse(user);

    }

    @PostAuthorize("returnObject.email == authentication.name or hasRole('ADMIN')")
    // Chỉ cho phép người dùng truy cập vào phương thức này nếu email của họ trùng với email của user được trả về hoặc họ có role ADMIN
    @Override
    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")  // Chỉ cho phép người dùng có role ADMIN truy cập vào phương thức này
    @Override
    public List<UserResponse> getUsers() {
        log.info("In method get user");
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("Authenticated user: {}", authentication.getName());

        authentication.getAuthorities().forEach(authority -> log.info("Authority: {}", authority.getAuthority()));

        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .toList();
    }


//    @Override
//    public void assignRoleToUser(UserAssignRoleRequest request, String userId, String role) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
//
//    Role parsedRole;
//        try {
//            parsedRole = Role.valueOf(role.toUpperCase());
//        } catch (IllegalArgumentException e) {
//            throw new AppException(ErrorCode.INVALID_ROLE);
//        }
//
//        userMapper.assignUserRoleFromRequest(request, user);
//        userRepository.save(user);
//    }

    @Override
    public void updateUserStatus(UserUpdateStatusRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUserStatusFromRequest(request, user);
        userRepository.save(user);
    }

}
