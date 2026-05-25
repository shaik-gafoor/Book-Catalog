package com.example.demo.Services.impl;

import com.example.demo.Services.AuthService;
import com.example.demo.Services.EmailService;
import com.example.demo.configrations.JwtProvider;
import com.example.demo.domain.UserRole;
import com.example.demo.exception.UserException;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.Subscription;
import com.example.demo.model.SubscriptionPlan;
import com.example.demo.model.PasswordResetToken;
import com.example.demo.model.User;
import com.example.demo.payload.dto.UserDTO;
import com.example.demo.payload.response.AuthResponse;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.repository.SubscriptionPlanRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.beans.Transient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class AuthServiceImpl implements AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CustomUserServiceImplementation customUserServiceImplementation;
    private final EmailService emailService;


    @Override
    public AuthResponse login(String username, String password) throws UserException {
        String loginValue = normalizeLogin(username);
        Authentication authentication = authenticate(loginValue,password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
//        Collection<? extends GrantedAuthority>authorities = authentication.getAuthorities();
//        String role = authorities.iterator().next().getAuthority();
        String token = jwtProvider.generateToken(authentication);

        User user = userRepository.findByEmailIgnoreCase(loginValue == null ? null : loginValue.toLowerCase());
        if (user == null) {
            user = userRepository.findByFullNameIgnoreCase(loginValue);
        }
        if (user == null) {
            throw new UserException("user not found with username - " + loginValue);
        }
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setTitle("Login success");
        response.setMessage("Welcome Back "+ username);
        response.setJwt(token);
        response.setUser(UserMapper.toDTO(user));

        return response;
    }

    private Authentication authenticate(String username, String password) throws UserException {
        UserDetails userDetails;
        try {
            userDetails = customUserServiceImplementation.loadUserByUsername(username);
        } catch (UsernameNotFoundException e) {
            throw new UserException(e.getMessage());
        }
        if(!passwordEncoder.matches(password,userDetails.getPassword())){
            throw new UserException("password not match");
        }
        return new UsernamePasswordAuthenticationToken(userDetails.getUsername(),null,userDetails.getAuthorities());
    }


    @Override
    public AuthResponse signup(UserDTO req) throws UserException {
        String email = normalizeEmail(req.getEmail());
        User user = userRepository.findByEmailIgnoreCase(email);

        if(user != null){
            throw new UserException("Email id already registed");
        }
        User createdUser = new User();
        createdUser.setEmail(email);
        createdUser.setPassword(passwordEncoder.encode(req.getPassword()));
        createdUser.setPhone(req.getPhone());
        createdUser.setFullName(req.getFullName());
        createdUser.setLastLogin(LocalDateTime.now());
        createdUser.setRole(String.valueOf(UserRole.ROLE_USER));

        User savedUser = userRepository.save(createdUser);
        createDefaultFreeSubscription(savedUser);

        Authentication auth = new UsernamePasswordAuthenticationToken(
            savedUser.getEmail(),
            null,
            AuthorityUtils.createAuthorityList(savedUser.getRole()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        String jwt = jwtProvider.generateToken(auth);
        AuthResponse response = new AuthResponse();
        response.setJwt(jwt);
        response.setTitle("Welcome "+createdUser.getFullName());
        response.setMessage("register success");
        response.setUser(UserMapper.toDTO(savedUser));
        return response;
    }

    private void createDefaultFreeSubscription(User user) throws UserException {
        SubscriptionPlan freePlan = subscriptionPlanRepository.findByPlanCode("FREE");
        if (freePlan == null) {
            throw new UserException("default subscription plan not found");
        }

        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(freePlan)
                .build();
        subscription.initializeFromPlan();
        subscription.setIsActive(true);
        subscription.setBooksCheckedOutThisMonth(0);
        subscription.setCurrentConcurrentCheckouts(0);
        subscription.setMonthlyQuotaResetDate(LocalDate.now().plusDays(30));
        subscriptionRepository.save(subscription);
    }



    @Transactional
    public void createPasswordResetToken(String email) throws UserException {

        String frontendUrl="";
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email));
        if(user ==  null){
            throw new UserException("user not found with given email");
        }
        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(5))
                .build();
        passwordResetTokenRepository.save(resetToken);
        String resetLink = frontendUrl + token;
        String subject = "Password Reset Request";
        String body ="You requested to reset your password.Use this link(valid 5 minutes):" + resetLink;
        emailService.sendEmail(user.getEmail(),subject,body);

    }


        private String normalizeEmail(String email) {
            return email == null ? null : email.trim().toLowerCase();
        }

        private String normalizeLogin(String value) {
            return value == null ? null : value.trim();
        }


    @Transactional
    public void resetPassword(String token, String newPassword) throws Exception {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token).orElseThrow(
                ()-> new Exception("token not valid")
        );
        if(resetToken.isExpired()){
            passwordResetTokenRepository.delete(resetToken);
            throw new Exception("token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);

    }
}
