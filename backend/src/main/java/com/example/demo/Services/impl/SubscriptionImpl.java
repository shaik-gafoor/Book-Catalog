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
import com.example.demo.payload.dto.UserDTO;
import com.example.demo.payload.request.PaymentInitiateRequest;
import com.example.demo.payload.response.PaymentInitiateResponse;
import com.example.demo.repository.SubscriptionPlanRepository;
import com.example.demo.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionImpl implements SubscriptionService {

    private final PaymentService paymentService;
    @Override
    public void deactivateExpiredSubscriptions() throws Exception {
        List<Subscription> expiredSubscriptions = subscriptionRepository
                .findExpiredActiveSubscriptions(LocalDate.now());

        for (Subscription subscription : expiredSubscriptions) {
            subscription.setIsActive(false);
            subscriptionRepository.save(subscription);
        }
    }

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final UserService userService;

    @Override
    public PaymentInitiateResponse subscribe(SubscriptionDTO subscriptionDTO) throws Exception {

        User user = userService.getCurrentUser();

        SubscriptionPlan plan =subscriptionPlanRepository
                .findById(subscriptionDTO.getPlanId())
                .orElseThrow(() -> new Exception("Plan not found!"));

        Subscription currentSubscription = subscriptionRepository
            .findActiveSubscriptionByUserId(user.getId(), LocalDate.now())
            .orElse(null);

        if (currentSubscription != null
            && currentSubscription.getPlan() != null
            && plan.getPlanCode().equalsIgnoreCase(currentSubscription.getPlan().getPlanCode())) {
            PaymentInitiateRequest paymentInitiateRequest = PaymentInitiateRequest
                .builder()
                .userId(user.getId())
                .subscriptionId(currentSubscription.getId())
                .paymentType(PaymentType.MEMBERSHIP)
                .gateway(PaymentGateway.RAZORPAY)
                .amount(currentSubscription.getPrice())
                .description("Library Subscription - " + plan.getName())
                .build();
            return paymentService.initiatePayment(paymentInitiateRequest);
        }

        if (currentSubscription != null) {
            currentSubscription.setIsActive(false);
            currentSubscription.setCancelledAt(LocalDateTime.now());
            currentSubscription.setCancellationReason("Upgraded to " + plan.getName());
            subscriptionRepository.save(currentSubscription);
        }

// Optional<Sub>

        Subscription subscription = subscriptionMapper.toEntity(subscriptionDTO,plan,user);
        subscription.initializeFromPlan();
        subscription.setIsActive(true);
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
        Subscription savedSubscription = subscriptionRepository.save(subscription);
// create payment (todo)


        PaymentInitiateRequest paymentInitiateRequest = PaymentInitiateRequest
                .builder()
                .userId(user.getId())
                .subscriptionId(subscription.getId())
                .paymentType(PaymentType.MEMBERSHIP)
                .gateway(PaymentGateway.RAZORPAY)
                .amount(subscription.getPrice())
                .description("Library Subscription - " + plan.getName())
                .build();
         return paymentService.initiatePayment(paymentInitiateRequest);
    }

    @Override
    public SubscriptionDTO getUsersActiveSubscription(Long userId) throws Exception {
        try {
            Long targetUserId = userId;
            if (targetUserId == null) {
                User currentUser = userService.getCurrentUser();
                targetUserId = currentUser.getId();
            }
            final Long resolvedUserId = targetUserId;
            Subscription subscription = subscriptionRepository
                    .findActiveSubscriptionByUserId(resolvedUserId, LocalDate.now())
                    .orElseGet(() -> createFallbackFreeSubscription(resolvedUserId));
            return subscription == null ? null : subscriptionMapper.toDTO(subscription);
        } catch (Exception ignored) {
            return null;
        }
    }

    private Subscription createFallbackFreeSubscription(Long userId) {
        User user;
        try {
            user = userService.findById(userId);
        } catch (Exception e) {
            return null;
        }

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
    public SubscriptionDTO cancelSubscription(Long subscriptionId, String reason) throws SubscriptionException {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionException(
                        "Subscription not found with ID: " + subscriptionId));
        if (!subscription.getIsActive()) {
            throw new SubscriptionException("Subscription is already inactive");
        }
        // Mark as cancelled
        subscription.setIsActive(false);
        subscription.setCancelledAt(LocalDateTime.now());
        subscription.setCancellationReason(reason != null ? reason : "Cancelled by user");
        subscription = subscriptionRepository.save(subscription);
        if (subscription.getPlan() == null || !"FREE".equalsIgnoreCase(subscription.getPlanCode())) {
            createFallbackFreeSubscription(subscription.getUser().getId());
        }
        return subscriptionMapper.toDTO(subscription);
    }

    @Override
    public SubscriptionDTO activateSubscription(Long subscriptionId, Long paymentId) throws SubscriptionException {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(
                        () -> new SubscriptionException("subscription not found by id!")
                );
// verify payment (todo)
        subscription.setIsActive(true);
        subscription = subscriptionRepository.save(subscription);
        return subscriptionMapper.toDTO(subscription);
    }

    @Override
    public List<SubscriptionDTO> getAllSubscriptions(Pageable pageable) {
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        return subscriptionMapper.toDTOList(subscriptions);
    }
}
