package com.example.demo.Services;

import com.example.demo.payload.dto.PaymentDTO;
import com.example.demo.payload.request.PaymentInitiateRequest;
import com.example.demo.payload.request.PaymentVerifyRequest;
import com.example.demo.payload.response.PaymentInitiateResponse;

public interface PaymentService {

    PaymentInitiateResponse initiatePayment(PaymentInitiateRequest req);

    PaymentDTO verifyPayment(PaymentVerifyRequest req);
}
