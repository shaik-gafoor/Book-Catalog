package com.example.demo.Services;

import com.example.demo.exception.UserException;
import com.example.demo.payload.dto.UserDTO;
import com.example.demo.payload.response.AuthResponse;

public interface AuthService {

    AuthResponse login(String username, String password) throws UserException;
    AuthResponse signup(UserDTO req) throws UserException;

    void createPasswordResetToken(String email) throws UserException;
    void resetPassword(String token, String newPassword);
}
