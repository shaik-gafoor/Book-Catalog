package com.example.demo.Services.impl;


import com.example.demo.Services.UserService;
import com.example.demo.mapper.UserMapper;
import com.example.demo.mapper.SubscriptionMapper;
import com.example.demo.model.Subscription;
import com.example.demo.model.SubscriptionPlan;
import com.example.demo.model.User;
import com.example.demo.payload.dto.UserDTO;
import com.example.demo.payload.request.UpdateProfileRequest;
import com.example.demo.payload.response.UserProfileResponse;
import com.example.demo.repository.SubscriptionPlanRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionMapper subscriptionMapper;


    @Override
    public User getCurrentUser() throws Exception {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if(user == null){
            throw new Exception("User not found");
        }
        return user;
    }

    @Override
    public UserProfileResponse getCurrentUserProfile() throws Exception {
        User currentUser = getCurrentUser();
        Subscription activeSubscription = subscriptionRepository
                .findActiveSubscriptionByUserId(currentUser.getId(), LocalDate.now())
                .orElseGet(() -> createFreeSubscription(currentUser));

        return new UserProfileResponse(
                UserMapper.toDTO(currentUser),
                subscriptionMapper.toDTO(activeSubscription)
        );
    }

    private Subscription createFreeSubscription(User user) {
        SubscriptionPlan freePlan = subscriptionPlanRepository.findByPlanCode("FREE");
        if (freePlan == null) {
            return null;
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
        return subscriptionRepository.save(subscription);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream().map(UserMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public User findById(Long id) throws Exception {
        return userRepository.findById(id).orElseThrow(
                () -> new Exception("user not found with given id!")
        );
    }

    @Override
    public UserDTO updateProfile(String email, UpdateProfileRequest request) throws Exception {
        User user = userRepository.findByEmail(email);
        if(user == null){
            throw new Exception("User not found");
        }

        if(request.getFullName() != null){
            user.setFullName(request.getFullName());
        }
        if(request.getPhone() != null){
            user.setPhone(request.getPhone());
        }
        if(request.getEmail() != null){
            user.setEmail(request.getEmail());
        }

        User savedUser = userRepository.save(user);
        return UserMapper.toDTO(savedUser);
    }
}
