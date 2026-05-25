package com.example.demo.Services;

import com.example.demo.model.Payment;
import com.example.demo.model.User;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${stripe.callback.base-url:http://localhost:5173}")
    private String callbackBaseUrl;

        @Value("${stripe.success-url:http://localhost:3000/success}")
        private String stripeSuccessUrl;

        @Value("${stripe.cancel-url:http://localhost:3000/cancel}")
        private String stripeCancelUrl;

    public Session createCheckoutSession(
            User user,
            Payment payment,
            String successUrl,
            String cancelUrl
    ) throws StripeException {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new IllegalStateException("Stripe secret key is not configured");
        }

        Stripe.apiKey = stripeSecretKey;

        String resolvedSuccessUrl = (successUrl == null || successUrl.isBlank())
                ? defaultSuccessUrl(payment)
                : successUrl;

        String resolvedCancelUrl = (cancelUrl == null || cancelUrl.isBlank())
                ? defaultCancelUrl()
                : cancelUrl;

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(resolvedSuccessUrl)
                .setCancelUrl(resolvedCancelUrl)
                .setCustomerEmail(user.getEmail())
                .putMetadata("paymentId", String.valueOf(payment.getId()))
                .putMetadata("userId", String.valueOf(user.getId()))
                .putMetadata("subscriptionId", payment.getSubscription() == null
                        ? ""
                        : String.valueOf(payment.getSubscription().getId()))
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("inr")
                                                .setUnitAmount(payment.getAmount() * 100)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(payment.getDescription() == null
                                                                        ? "Subscription payment"
                                                                        : payment.getDescription())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();

        return Session.create(params);
    }

    private String defaultSuccessUrl(Payment payment) {
        String base = (stripeSuccessUrl == null || stripeSuccessUrl.isBlank())
                ? (callbackBaseUrl + "/subscriptions")
                : stripeSuccessUrl;

        String delimiter = base.contains("?") ? "&" : "?";
        Long subscriptionId = payment.getSubscription() == null ? null : payment.getSubscription().getId();
        String subscriptionPart = subscriptionId == null ? "" : "&subscriptionId=" + subscriptionId;
        return base + delimiter + "stripe=success&paymentId=" + payment.getId()
                + subscriptionPart + "&session_id={CHECKOUT_SESSION_ID}";
    }

    private String defaultCancelUrl() {
        String base = (stripeCancelUrl == null || stripeCancelUrl.isBlank())
                ? (callbackBaseUrl + "/subscriptions")
                : stripeCancelUrl;
        String delimiter = base.contains("?") ? "&" : "?";
        return base + delimiter + "stripe=cancelled";
    }
}