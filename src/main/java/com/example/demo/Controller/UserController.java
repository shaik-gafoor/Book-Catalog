package com.example.demo.Controller;

import com.example.demo.Services.UserService;
import com.example.demo.payload.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/list")
    public ResponseEntity<List<UserDTO>> getAllUsers(){
        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    @GetMapping("/profile")
    public ResponseEntity<List<UserDTO>> getUserProfile() throws Exception {
        return ResponseEntity.ok(Collections.singletonList(userService.getCurrentUser()));
    }
}
