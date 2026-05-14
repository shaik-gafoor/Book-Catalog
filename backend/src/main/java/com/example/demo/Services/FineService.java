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
    FineDTO createFine(CreateFineRequest createFineRequest) throws Exception;
    PaymentInitiateResponse payFine(Long fineId, String transactionId) throws Exception;

    void markFineAsPaid(Long fineId, Long amount, String transactionId) throws Exception;

    FineDTO waiveFine(WaiveFineRequest waiveFineRequest) throws Exception;

    List<FineDTO> getMyFines(FineStatus status, FineType type) throws Exception;

    pageResponse<FineDTO> getAllFines(
            FineStatus status,
            FineType type,
            Long userId,
            int page,
            int size
    );
}
