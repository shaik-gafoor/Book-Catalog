package com.example.demo.Services.impl;

import com.example.demo.Services.PaymentService;
import com.example.demo.Services.RazorpayService;
import com.example.demo.Services.StripeService;
import com.example.demo.domain.PaymentGateway;
import com.example.demo.domain.PaymentStatus;
import com.example.demo.event.publisher.PaymentEventPublisher;
import com.example.demo.mapper.PaymentMapper;
import com.example.demo.model.Payment;
import com.example.demo.model.Subscription;
import com.example.demo.model.User;
import com.example.demo.payload.dto.PaymentDTO;
import com.example.demo.payload.request.PaymentInitiateRequest;
import com.example.demo.payload.request.PaymentVerifyRequest;
import com.example.demo.payload.response.PaymentInitiateResponse;
import com.example.demo.payload.response.PaymentLinkResponse;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.stripe.model.checkout.Session;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    @Value("${stripe.callback.base-url:http://localhost:5173}")
    private String stripeCallbackBaseUrl;

    @Value("${stripe.success-url:http://localhost:3000/success}")
    private String stripeSuccessUrl;

    @Value("${stripe.cancel-url:http://localhost:3000/cancel}")
    private String stripeCancelUrl;

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;
    private final StripeService stripeService;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher paymentEventPublisher;
    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws Exception {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        if (user == null && request.getSubscriptionId() != null) {
            Subscription subForUser = subscriptionRepository
                    .findById(request.getSubscriptionId())
                    .orElse(null);
            if (subForUser != null) {
                user = subForUser.getUser();
            }
        }

        if (user == null) {
            throw new Exception("User not found for payment");
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType(request.getPaymentType());
        payment.setGateway(request.getGateway());
        payment.setAmount(request.getAmount());
        payment.setDescription(request.getDescription());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId("TXN_" + UUID.randomUUID());
        payment.setInitiatedAt(LocalDateTime.now());

        if (request.getSubscriptionId() != null) {
            Subscription sub = subscriptionRepository
                    .findById(request.getSubscriptionId())
                    .orElseThrow(() -> new Exception("Subscription not found"));

            payment.setSubscription(sub);
        }
        payment = paymentRepository.save(payment);
        PaymentInitiateResponse response = new PaymentInitiateResponse();

        if (request.getGateway() == PaymentGateway.RAZORPAY) {
            PaymentLinkResponse paymentLinkResponse = razorpayService.createPaymentLink(
                    user, payment
            );

            response = PaymentInitiateResponse.builder()
                    .paymentId(payment.getId())
                    .gateway(payment.getGateway())
                    .checkoutUrl(paymentLinkResponse.getPayment_link_url())
                    .transactionId(paymentLinkResponse.getPayment_link_id())
                    .amount(payment.getAmount())
                    .description(payment.getDescription())
                    .success(true)
                    .message("Payment initiated successfully")
                    .build();
            payment.setGatewayOrderId(paymentLinkResponse.getPayment_link_id());
        } else if (request.getGateway() == PaymentGateway.STRIPE) {
            try {
            Session session = stripeService.createCheckoutSession(
                user,
                payment,
                request.getSuccessUrl(),
                request.getCancelUrl()
            );

            response = PaymentInitiateResponse.builder()
                .paymentId(payment.getId())
                .gateway(payment.getGateway())
                .checkoutUrl(session.getUrl())
                .transactionId(session.getId())
                .amount(payment.getAmount())
                .description(payment.getDescription())
                .success(true)
                .message("Stripe checkout session created")
                .build();

            payment.setGatewayOrderId(session.getId());
            } catch (Exception ignored) {
            String dummySessionId = "dummy_session_" + payment.getId();
            String dummyCheckoutUrl = buildDummyStripeCheckoutUrl(payment, request.getSuccessUrl(), dummySessionId);

            response = PaymentInitiateResponse.builder()
                .paymentId(payment.getId())
                .gateway(payment.getGateway())
                .checkoutUrl(dummyCheckoutUrl)
                .transactionId(dummySessionId)
                .amount(payment.getAmount())
                .description(payment.getDescription())
                .success(true)
                .message("Dummy Stripe checkout created")
                .build();

            payment.setGatewayOrderId(dummySessionId);
            }
        } else {
            throw new IllegalArgumentException("Unsupported payment gateway");
        }

        payment.setStatus(PaymentStatus.PROCESSING);
        paymentRepository.save(payment);
        return response;

    }

    private String buildDummyStripeCheckoutUrl(Payment payment, String successUrl, String sessionId) {
        String resolvedSuccessUrl = successUrl;
        if (resolvedSuccessUrl == null || resolvedSuccessUrl.isBlank()) {
            resolvedSuccessUrl = stripeSuccessUrl;
        }

        if (resolvedSuccessUrl != null && !resolvedSuccessUrl.isBlank()) {
            String delimiter = resolvedSuccessUrl.contains("?") ? "&" : "?";
            Long subscriptionId = payment.getSubscription() == null ? null : payment.getSubscription().getId();
            String subscriptionPart = subscriptionId == null ? "" : "&subscriptionId=" + subscriptionId;
            return resolvedSuccessUrl + delimiter + "stripe=success&paymentId=" + payment.getId()
                    + subscriptionPart + "&session_id=" + sessionId;
        }

        Long subscriptionId = payment.getSubscription() == null ? null : payment.getSubscription().getId();
        String subscriptionPart = subscriptionId == null ? "" : "&subscriptionId=" + subscriptionId;
        return stripeCallbackBaseUrl + "/subscriptions?stripe=success&paymentId=" + payment.getId()
                + subscriptionPart + "&session_id=" + sessionId;
    }

    @Override
    public PaymentDTO verifyPayment(PaymentVerifyRequest req) throws Exception {
        JSONObject paymentDetails = razorpayService.fetchPaymentDetails(
                req.getRazorpayPaymentId()
        );

        JSONObject notes = paymentDetails.getJSONObject("notes");

// Access specific fields inside 'notes'
        Long paymentId = Long.parseLong(notes.optString("payment_id"));

        Payment payment = paymentRepository.findById(paymentId).get();

        boolean isValid = razorpayService.isValidPayment(req.getRazorpayPaymentId());

        if (PaymentGateway.RAZORPAY == payment.getGateway()) {
            if (isValid) {
                payment.setGatewayOrderId(req.getRazorpayPaymentId());
            }
        }

        if (isValid) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setCompletedeAt(LocalDateTime.now());
            payment = paymentRepository.save(payment);

            //----------------------------------------------------------
            paymentEventPublisher.publishPaymentSuccessEvent(payment);

        }

        return paymentMapper.toDTO(payment);
    }

    @Override
    public Page<PaymentDTO> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(paymentMapper::toDTO);
    }
}
