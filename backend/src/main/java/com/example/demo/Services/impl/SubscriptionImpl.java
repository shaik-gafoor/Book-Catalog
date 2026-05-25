package com.example.demo.Services.impl;

import com.example.demo.Services.PaymentService;
import com.example.demo.Services.SubscriptionService;
import com.example.demo.Services.UserService;
import com.example.demo.domain.PaymentGateway;
import com.example.demo.domain.PaymentType;
import com.example.demo.exception.SubscriptionException;
import com.example.demo.mapper.SubscriptionMapper;
import com.example.demo.model.Subscription;
import com.example.demo.model.SubscriptionPlan;
import com.example.demo.model.User;
import com.example.demo.payload.dto.SubscriptionDTO;
import com.example.demo.payload.request.PaymentInitiateRequest;
import com.example.demo.payload.response.PaymentInitiateResponse;
import com.example.demo.repository.SubscriptionPlanRepository;
import com.example.demo.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionImpl implements SubscriptionService {

    private final PaymentService paymentService;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final UserService userService;

    // ─────────────────────────────────────────────
    // Subscribe
    // ─────────────────────────────────────────────
    @Override
    public PaymentInitiateResponse subscribe(SubscriptionDTO subscriptionDTO) throws Exception {

        User user = userService.getCurrentUser();
        SubscriptionPlan plan = resolvePlan(subscriptionDTO);

        // Safe: returns list, take first (most recent) if present
        List<Subscription> activeSubs = subscriptionRepository
                .findActiveSubscriptionsByUserId(user.getId(), LocalDate.now());
        Subscription currentSubscription = activeSubs.isEmpty() ? null : activeSubs.get(0);

        // Same plan — just re-initiate payment (e.g. renewal)
        if (currentSubscription != null
                && currentSubscription.getPlan() != null
                && plan.getPlanCode().equalsIgnoreCase(currentSubscription.getPlan().getPlanCode())) {

            PaymentInitiateRequest paymentInitiateRequest = PaymentInitiateRequest
                    .builder()
                    .userId(user.getId())
                    .subscriptionId(currentSubscription.getId())
                    .paymentType(PaymentType.MEMBERSHIP)
                    .gateway(PaymentGateway.STRIPE)
                    .amount(currentSubscription.getPrice())
                    .description("Library Subscription - " + plan.getName())
                    .build();
            return paymentService.initiatePayment(paymentInitiateRequest);
        }

        // Different plan — deactivate current
        if (currentSubscription != null) {
            currentSubscription.setIsActive(false);
            currentSubscription.setCancelledAt(LocalDateTime.now());
            currentSubscription.setCancellationReason("Upgraded to " + plan.getName());
            subscriptionRepository.save(currentSubscription);
        }

        // Create new subscription (inactive until payment confirmed)
        Subscription subscription = subscriptionMapper.toEntity(subscriptionDTO, plan, user);
        subscription.initializeFromPlan();
        subscription.setIsActive(false);
        subscription.setBooksCheckedOutThisMonth(
                currentSubscription != null && currentSubscription.getBooksCheckedOutThisMonth() != null
                        ? currentSubscription.getBooksCheckedOutThisMonth()
                        : 0
        );
        subscription.setCurrentConcurrentCheckouts(
                currentSubscription != null && currentSubscription.getCurrentConcurrentCheckouts() != null
                        ? currentSubscription.getCurrentConcurrentCheckouts()
                        : 0
        );
        subscription.setMonthlyQuotaResetDate(LocalDate.now().plusDays(30));
        subscriptionRepository.save(subscription);

        PaymentInitiateRequest paymentInitiateRequest = PaymentInitiateRequest
                .builder()
                .userId(user.getId())
                .subscriptionId(subscription.getId())
                .paymentType(PaymentType.MEMBERSHIP)
                .gateway(PaymentGateway.STRIPE)
                .amount(subscription.getPrice())
                .description("Library Subscription - " + plan.getName())
                .build();

        return paymentService.initiatePayment(paymentInitiateRequest);
    }

    // ─────────────────────────────────────────────
    // Get active subscription
    // ─────────────────────────────────────────────
    @Override
    public SubscriptionDTO getUsersActiveSubscription(Long userId) throws Exception {
        try {
            Long targetUserId = userId;
            if (targetUserId == null) {
                User currentUser = userService.getCurrentUser();
                targetUserId = currentUser.getId();
            }
            final Long resolvedUserId = targetUserId;

            // Safe list query — no NonUniqueResultException
            List<Subscription> activeSubs = subscriptionRepository
                    .findActiveSubscriptionsByUserId(resolvedUserId, LocalDate.now());

            Subscription subscription;
            if (!activeSubs.isEmpty()) {
                subscription = activeSubs.get(0); // most recent active
            } else {
                subscription = getOrCreateFallbackFreeSubscription(resolvedUserId);
            }

            return subscription == null ? null : subscriptionMapper.toDTO(subscription);

        } catch (Exception ignored) {
            return null;
        }
    }

    // ─────────────────────────────────────────────
    // Fallback FREE subscription — safe, no duplicates
    // ─────────────────────────────────────────────
    private Subscription getOrCreateFallbackFreeSubscription(Long userId) {
        User user;
        try {
            user = userService.findById(userId);
        } catch (Exception e) {
            return null;
        }

        SubscriptionPlan freePlan = subscriptionPlanRepository.findByPlanCode("FREE");
        if (freePlan == null) return null;

        // ✅ Check for existing FREE subscription — reactivate instead of creating duplicate
        List<Subscription> existingFreeSubs = subscriptionRepository
                .findAllByUserIdAndPlanCode(userId, "FREE");

        if (!existingFreeSubs.isEmpty()) {
            Subscription existing = existingFreeSubs.get(existingFreeSubs.size() - 1);
            if (existing.getIsActive()) {
                return existing; // already active, just return it
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

        // No FREE sub exists at all — create one
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

    // ─────────────────────────────────────────────
    // Cancel subscription
    // ─────────────────────────────────────────────
    @Override
    public SubscriptionDTO cancelSubscription(Long subscriptionId, String reason) throws SubscriptionException {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionException(
                        "Subscription not found with ID: " + subscriptionId));

        if (!subscription.getIsActive()) {
            throw new SubscriptionException("Subscription is already inactive");
        }

        subscription.setIsActive(false);
        subscription.setCancelledAt(LocalDateTime.now());
        subscription.setCancellationReason(reason != null ? reason : "Cancelled by user");
        subscription = subscriptionRepository.save(subscription);

        // Fall back to FREE only if the cancelled plan was not already FREE
        if (subscription.getPlan() == null
                || !"FREE".equalsIgnoreCase(subscription.getPlanCode())) {
            getOrCreateFallbackFreeSubscription(subscription.getUser().getId());
        }

        return subscriptionMapper.toDTO(subscription);
    }

    // ─────────────────────────────────────────────
    // Activate subscription (after payment confirmed)
    // ─────────────────────────────────────────────
    @Override
    public SubscriptionDTO activateSubscription(Long subscriptionId, Long paymentId) throws SubscriptionException {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionException("Subscription not found by id!"));

        subscription.setIsActive(true);
        subscription = subscriptionRepository.save(subscription);
        return subscriptionMapper.toDTO(subscription);
    }

    // ─────────────────────────────────────────────
    // Get all subscriptions
    // ─────────────────────────────────────────────
    @Override
    public List<SubscriptionDTO> getAllSubscriptions(Pageable pageable) {
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        return subscriptionMapper.toDTOList(subscriptions);
    }

    // ─────────────────────────────────────────────
    // Deactivate expired subscriptions (scheduled job)
    // ─────────────────────────────────────────────
    @Override
    public void deactivateExpiredSubscriptions() throws Exception {
        List<Subscription> expiredSubscriptions = subscriptionRepository
                .findExpiredActiveSubscriptions(LocalDate.now());

        for (Subscription subscription : expiredSubscriptions) {
            subscription.setIsActive(false);
            subscriptionRepository.save(subscription);
        }
    }

    // ─────────────────────────────────────────────
    // Resolve plan from DTO
    // ─────────────────────────────────────────────
    private SubscriptionPlan resolvePlan(SubscriptionDTO subscriptionDTO) throws Exception {
        if (subscriptionDTO.getPlanId() != null) {
            return subscriptionPlanRepository
                    .findById(subscriptionDTO.getPlanId())
                    .orElseThrow(() -> new Exception("Plan not found!"));
        }

        if (StringUtils.hasText(subscriptionDTO.getPlanCode())) {
            SubscriptionPlan byCode = subscriptionPlanRepository
                    .findByPlanCode(subscriptionDTO.getPlanCode());
            if (byCode != null) return byCode;
        }

        throw new Exception("Plan not found!");
    }
}