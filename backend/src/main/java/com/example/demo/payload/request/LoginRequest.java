package com.example.demo.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @NotNull(message =" user name or emailis required")
    private String username;

    @NotNull(message =" password is required")
    private String password;
}
