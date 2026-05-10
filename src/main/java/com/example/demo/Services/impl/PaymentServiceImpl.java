package com.example.demo.Services.impl;

import com.example.demo.Services.PaymentService;
import com.example.demo.Services.RazorpayService;
import com.example.demo.domain.PaymentGateway;
import com.example.demo.domain.PaymentStatus;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;
    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws Exception {
        User user = userRepository.findById(request.getUserId()).get();
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
        }        payment.setStatus(PaymentStatus.PROCESSING);
        paymentRepository.save(payment);
        return response;

    }

    @Override
    public PaymentDTO verifyPayment(PaymentVerifyRequest req) {
        return null;
    }

    @Override
    public Page<PaymentDTO> getAllPayments(Pageable pageable) {
        return null;
    }
}
