package com.example.demo.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentVerifyRequest {
    private String razorpayPaymentId;
//    private String razorpayOrderId;
//    private String razorpaySignature;

    // Stripe specific fields
    private String stripePaymentIntentId;
    private String stripePaymentIntentStatus;
}
