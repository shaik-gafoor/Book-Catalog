package com.example.demo.Services;

import com.example.demo.payload.dto.PaymentDTO;
import com.example.demo.payload.request.PaymentInitiateRequest;
import com.example.demo.payload.request.PaymentVerifyRequest;
import com.example.demo.payload.response.PaymentInitiateResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {

    PaymentInitiateResponse initiatePayment(PaymentInitiateRequest req) throws Exception;

    PaymentDTO verifyPayment(PaymentVerifyRequest req);

    Page<PaymentDTO> getAllPayments(Pageable pageable);

}
