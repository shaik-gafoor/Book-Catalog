package com.example.demo.payload.dto;

import com.example.demo.domain.UserRole;
import com.example.demo.model.User;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO  {
    private Long id;

    @NotNull(message = "email is required")
    private String email;

    @NotNull(message = "password is required")
    private String password;
    private String phone;

    @NotNull(message = "FullName is required")
    private String fullName;

    private UserRole role;
    private String username;

    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}
