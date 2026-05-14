package com.example.demo.Services;

import com.example.demo.model.User;
import com.example.demo.payload.dto.UserDTO;

import java.util.List;

public interface UserService {
    public User getCurrentUser() throws Exception;
    public List<UserDTO> getAllUsers();
    User findById(Long id) throws Exception;
}
