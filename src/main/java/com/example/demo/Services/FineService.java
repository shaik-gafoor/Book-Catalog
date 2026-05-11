package com.example.demo.Services;

import com.example.demo.domain.FineStatus;
import com.example.demo.domain.FineType;
import com.example.demo.payload.dto.FineDTO;
import com.example.demo.payload.request.CreateFineRequest;
import com.example.demo.payload.request.WaiveFineRequest;
import com.example.demo.payload.response.PaymentInitiateResponse;
import com.example.demo.payload.response.pageResponse;

import java.util.List;

public interface FineService {
    FineDTO createFine(CreateFineRequest createFineRequest);
    PaymentInitiateResponse payFine(Long fineId, String transactionId);

    void markFineAsPaid(Long fineId, Long amount, String transactionId);

    FineDTO waiveFine(WaiveFineRequest waiveFineRequest);

    List<FineDTO> getMyFines(FineStatus status, FineType type);

    pageResponse<FineDTO> getAllFines(
            FineStatus status,
            FineType type,
            Long userId,
            int page,
            int size
    );
}
