package com.example.demo.Services;

import com.example.demo.payload.dto.UserDTO;
import com.example.demo.payload.response.AuthResponse;

public interface AuthService {

    AuthResponse login(String username, String password);
    AuthResponse signup(UserDTO req);

    void createPasswordResetToken(String email);
    void resetPassword(String token, String newPassword);
}
