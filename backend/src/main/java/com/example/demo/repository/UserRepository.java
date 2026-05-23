package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    User findByEmail(String email);
    User findByEmailIgnoreCase(String email);
    User findByFullNameIgnoreCase(String fullName);
}
