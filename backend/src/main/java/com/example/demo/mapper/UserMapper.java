package com.example.demo.mapper;

import com.example.demo.domain.UserRole;
import com.example.demo.model.User;
import com.example.demo.payload.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class UserMapper {
    public static UserDTO toDTO(User user){
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setPhone(user.getPhone());
        userDTO.setLastLogin(user.getLastLogin());
        UserRole role = UserRole.ROLE_USER;
        if (user.getRole() != null && !user.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(user.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                role = UserRole.ROLE_USER;
            }
        }
        userDTO.setRole(role);

        return userDTO;
    }

    public static List<UserDTO> toDTOList(List<User> users){
        return users.stream().map(UserMapper::toDTO).collect(Collectors.toList());
    }

    public static Set<UserDTO> toDTOSet(Set<User> users){
        return  users.stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toSet());
    }

    public static User toEntity(UserDTO userDTO){
        User createdUser = new User();
        createdUser.setEmail(userDTO.getEmail());
        createdUser.setPassword(userDTO.getPassword());
        createdUser.setCreatedAt(LocalDateTime.now());
        createdUser.setPhone(userDTO.getPhone());
        createdUser.setFullName(userDTO.getFullName());
        createdUser.setRole(createdUser.getRole());

        return createdUser;
    }
}
