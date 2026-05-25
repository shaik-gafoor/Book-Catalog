package com.example.demo.Services;

import com.example.demo.model.User;
import com.example.demo.payload.dto.UserDTO;
import com.example.demo.payload.request.UpdateProfileRequest;
import com.example.demo.payload.response.UserProfileResponse;

import java.util.List;

public interface UserService {
    public User getCurrentUser() throws Exception;
    User getCurrentUser(Long userId) throws Exception;
    UserProfileResponse getCurrentUserProfile() throws Exception;
    UserProfileResponse getCurrentUserProfile(Long userId) throws Exception;
    public List<UserDTO> getAllUsers();
    User findById(Long id) throws Exception;
    UserDTO updateProfile(String email, UpdateProfileRequest request) throws Exception;
}
