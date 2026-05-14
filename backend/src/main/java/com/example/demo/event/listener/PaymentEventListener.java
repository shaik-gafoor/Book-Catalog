package com.example.demo.event.listener;

import com.example.demo.Services.SubscriptionService;
import com.example.demo.exception.SubscriptionException;
import com.example.demo.model.Payment;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentEventListener {
    private final SubscriptionService subscriptionService;

    @Async
    @EventListener
    @Transactional
    public void handlePaymentSuccess(Payment payment) throws SubscriptionException {
        switch (payment.getPaymentType()) {
            case FINE:
            case LOST_BOOK_PENALTY:
            case DAMAGED_BOOK_PENALTY:
                // Logic for book-related penalties would likely go here
                break;

            case MEMBERSHIP:
                subscriptionService.activateSubscription(
                        payment.getSubscription().getId(),
                        payment.getId()
                );
                break;
        }
    }
}
