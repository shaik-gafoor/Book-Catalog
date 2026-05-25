package com.example.demo.Services.impl;

import com.example.demo.model.Subscription;
import com.example.demo.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionQuotaScheduler {

    private final SubscriptionRepository subscriptionRepository;

    @Scheduled(cron = "0 0 0 1 * *")
    public void resetMonthlyQuotas() {
        List<Subscription> activeSubscriptions = subscriptionRepository.findAllByIsActiveTrue();
        LocalDate nextResetDate = LocalDate.now().plusDays(30);

        for (Subscription subscription : activeSubscriptions) {
            if (subscription == null) {
                continue;
            }
            subscription.setBooksCheckedOutThisMonth(0);
            subscription.setMonthlyQuotaResetDate(nextResetDate);
            subscriptionRepository.save(subscription);
        }
    }
}