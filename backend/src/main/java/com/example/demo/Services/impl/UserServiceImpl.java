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
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(principal);
        if (user == null) {
            user = userRepository.findByEmail(principal);
        }
        if (user == null) {
            user = userRepository.findByFullNameIgnoreCase(principal);
        }
        if (user == null) {
            throw new Exception("User not found");
        }
        return user;
    }

    @Override
    public User getCurrentUser(Long userId) throws Exception {
        if (userId != null) {
            User byId = userRepository.findById(userId).orElse(null);
            if (byId != null) {
                return byId;
            }
        }
        return getCurrentUser();
    }

    @Override
    public UserProfileResponse getCurrentUserProfile() throws Exception {
        return getCurrentUserProfile(null);
    }

    @Override
    public UserProfileResponse getCurrentUserProfile(Long userId) throws Exception {
        User currentUser = getCurrentUser(userId);

        // ✅ Use list-based query — no NonUniqueResultException
        List<Subscription> activeSubs = subscriptionRepository
                .findActiveSubscriptionsByUserId(currentUser.getId(), LocalDate.now());

        Subscription activeSubscription;
        if (!activeSubs.isEmpty()) {
            activeSubscription = activeSubs.get(0); // most recent active
        } else {
            activeSubscription = getOrCreateFreeSubscription(currentUser);
        }

        return new UserProfileResponse(
                UserMapper.toDTO(currentUser),
                subscriptionMapper.toDTO(activeSubscription)
        );
    }

    /**
     * Finds or reactivates an existing FREE subscription instead of
     * always inserting a new row (which caused duplicate-result crashes).
     */
    private Subscription getOrCreateFreeSubscription(User user) {
        SubscriptionPlan freePlan = subscriptionPlanRepository.findByPlanCode("FREE");
        if (freePlan == null) return null;

        // ✅ Check for existing FREE sub — reactivate instead of creating duplicate
        List<Subscription> existingFreeSubs = subscriptionRepository
                .findAllByUserIdAndPlanCode(user.getId(), "FREE");

        if (!existingFreeSubs.isEmpty()) {
            Subscription existing = existingFreeSubs.get(existingFreeSubs.size() - 1);
            if (existing.getIsActive()) {
                return existing;
            }
            // Reactivate the existing one
            existing.setIsActive(true);
            existing.setStartDate(LocalDate.now());
            existing.setEndDate(LocalDate.now().plusYears(100));
            existing.setMonthlyQuotaResetDate(LocalDate.now().plusDays(30));
            existing.setCancelledAt(null);
            existing.setCancellationReason(null);
            return subscriptionRepository.save(existing);
        }

        // No FREE sub at all — create one
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
        if (user == null) {
            throw new Exception("User not found");
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        User savedUser = userRepository.save(user);
        return UserMapper.toDTO(savedUser);
    }
}