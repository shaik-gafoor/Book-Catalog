package com.example.demo.Services.impl;

import com.example.demo.domain.UserRole;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    public final UserRepository userRepository;
    public final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args){
        initializedAdminUser();
    }

    private void initializedAdminUser(){
        String adminEmail = "gafoor7898@gmail.com";
        String adminPassword = "123456789";

        if(userRepository.findByEmail(adminEmail) == null){
            User user = User.builder()
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .fullName("Shaik Gafoor")
                    .role(String.valueOf(UserRole.ROLE_ADMIN))
                    .build();

            User admin = userRepository.save(user);
        }
    }
}
