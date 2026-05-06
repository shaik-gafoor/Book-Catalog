package com.example.demo.Services;

import com.example.demo.payload.dto.UserDTO;

import java.util.List;

public interface UserService {
    public UserDTO getCurrentUser() throws Exception;
    public List<UserDTO> getAllUsers();
}
