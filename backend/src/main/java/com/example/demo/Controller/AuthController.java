package com.example.demo.Controller;

import com.example.demo.Services.AuthService;
import com.example.demo.exception.UserException;
import com.example.demo.payload.dto.UserDTO;
import com.example.demo.payload.request.ForgotPasswordRequest;
import com.example.demo.payload.request.LoginRequest;
import com.example.demo.payload.request.ResetPasswordRequest;
import com.example.demo.payload.response.ApiResponse;
import com.example.demo.payload.response.AuthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping ("/signup")
    public ResponseEntity<AuthResponse> signupHandler(
                        @Valid @RequestBody  UserDTO req
            ) throws UserException{
        AuthResponse res = authService.signup(req);
        return ResponseEntity.ok(res);
    }

    @PostMapping ("/login")
    public ResponseEntity<AuthResponse> loginHandler(
            @Valid @RequestBody LoginRequest req
    ) throws UserException{
        AuthResponse res = authService.login(req.getUsername(), req.getPassword());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) throws UserException {
        authService.createPasswordResetToken(request.getEmail());
        ApiResponse res = new ApiResponse(
                "A Reset link was sent to your email.",true
        );
        return ResponseEntity.ok(res);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) throws Exception {
        authService.resetPassword(request.getToken(),request.getPassword());
        ApiResponse res = new ApiResponse(
                "Password reset successful",true
        );
        return ResponseEntity.ok(res);
    }
}
