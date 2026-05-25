package com.example.demo.Services.impl;

import com.example.demo.Services.FineService;
import com.example.demo.Services.PaymentService;
import com.example.demo.Services.UserService;
import com.example.demo.domain.FineStatus;
import com.example.demo.domain.FineType;
import com.example.demo.domain.UserRole;
import com.example.demo.domain.PaymentGateway;
import com.example.demo.domain.PaymentType;
import com.example.demo.mapper.FineMapper;
import com.example.demo.model.BookLoan;
import com.example.demo.model.Fine;
import com.example.demo.model.User;
import com.example.demo.payload.dto.FineDTO;
import com.example.demo.payload.request.CreateFineRequest;
import com.example.demo.payload.request.PaymentInitiateRequest;
import com.example.demo.payload.request.WaiveFineRequest;
import com.example.demo.payload.response.PaymentInitiateResponse;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookLoanRepository;
import com.example.demo.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FineServiceImpl implements FineService {

    private final BookLoanRepository bookLoanRepository;
    private final FineRepository fineRepository;
    private final FineMapper fineMapper;
    private final UserService userService;
    private final PaymentService paymentService;


    @Override
    public FineDTO createFine(CreateFineRequest createFineRequest) throws Exception {
        // 1. validate book loan exist
        BookLoan bookLoan = bookLoanRepository.findById(createFineRequest.getBookLoanId())
                .orElseThrow(() -> new Exception("Book loan doesn't exist"));

// 2. create fine
        Fine fine = Fine.builder()
                .bookLoan(bookLoan)
                .user(bookLoan.getUser())
                .type(createFineRequest.getType())
                .amount(createFineRequest.getAmount())
                .status(FineStatus.PENDING)
                .reason(createFineRequest.getReason())
                .notes(createFineRequest.getNotes())
                .build();
        Fine savedFine = fineRepository.save(fine);

        return fineMapper.toDTO(savedFine); // Note: Usually you would return the saved entity or a DTO here
    }

    @Override
    public PaymentInitiateResponse payFine(Long fineId, String transactionId) throws Exception {
        // 1. validate fine exist
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new Exception("Fine doesn't exist"));

// 2. check already paid
        if (fine.getStatus().equals(FineStatus.PAID)) {
            throw new Exception("fine already paid");
        }

        if (fine.getStatus().equals(FineStatus.WAIVED)) {
            throw new Exception("fine waived");
        }

// Get the current user session
        User user = userService.getCurrentUser();

// Build the payment request
        PaymentInitiateRequest request = PaymentInitiateRequest.builder()
                .userId(user.getId())
                .fineId(fine.getId())
                .paymentType(PaymentType.FINE)
                .gateway(PaymentGateway.RAZORPAY)
                .amount(fine.getAmount())
                .description("library fine payment")
                .build();

// Return the result of the payment service initiation
        return paymentService.initiatePayment(request);
    }

    @Override
    public void markFineAsPaid(Long fineId, Long amount, String transactionId) throws Exception {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new Exception(
                        "Fine not found with id: " + fineId));

        // Apply payment amount safely
        fine.applyPayment(amount);
        fine.setTransactionId(transactionId);
        fine.setStatus(FineStatus.PAID);
        fine.setUpdatedAt(LocalDateTime.now());

        fineRepository.save(fine);
    }

    @Override
    public FineDTO waiveFine(WaiveFineRequest waiveFineRequest) throws Exception {
        // 1. Find the fine or throw an error if missing
        Fine fine = fineRepository.findById(waiveFineRequest.getFineId())
                .orElseThrow(() -> new Exception("Fine not found with id: " + waiveFineRequest.getFineId()));

                User currentUser = userService.getCurrentUser();
                if (!UserRole.ROLE_ADMIN.equals(currentUser.getRole())) {
                        throw new Exception("Only admin can waive fines");
                }

// 2. Check if already waived or paid to prevent redundant operations
        if (fine.getStatus() == FineStatus.WAIVED) {
            throw new Exception("Fine has already been waived");
        }

        if (fine.getStatus() == FineStatus.PAID) {
            throw new Exception("Fine has already been paid and cannot be waived");
        }

// 3. Waive the fine using the current admin session
        fine.waive(currentUser, waiveFineRequest.getReason());

// 4. Save the changes and return the mapped DTO
        Fine savedFine = fineRepository.save(fine);

        return fineMapper.toDTO(savedFine);
    }

    @Override
    public List<FineDTO> getMyFines(FineStatus status, FineType type) throws Exception {
        User currentUser = userService.getCurrentUser();
        List<Fine> fines;

        // Apply filters based on parameters
        if (status != null && type != null) {
            // Filter by both Status AND Type using Java Streams
            fines = fineRepository.findByUserId(currentUser.getId()).stream()
                    .filter(f -> f.getStatus() == status && f.getType() == type)
                    .collect(Collectors.toList());
        } else if (status != null) {
            // Filter by Status only
            fines = fineRepository.findByUserId(currentUser.getId()).stream()
                    .filter(f -> f.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (type != null) {
            // Filter by Type only using a specialized Repository method
            fines = fineRepository.findByUserIdAndType(currentUser.getId(), type);
        } else {
            // No filters - return all fines for the user
            fines = fineRepository.findByUserId(currentUser.getId());
        }

        // Map the entities to DTOs before returning
        return fines.stream()
                .map(fineMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public pageResponse<FineDTO> getAllFines(FineStatus status, FineType type, Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        Page<Fine> finePage = fineRepository.findAllWithFilters(
                userId,
                status,
                type,
                pageable
        );

        return convertToPageResponse(finePage);
    }

    private pageResponse<FineDTO> convertToPageResponse(Page<Fine> finePage) {
        List<FineDTO> fineDTOs = finePage.getContent().stream()
                .map(fineMapper::toDTO)
                .collect(Collectors.toList());

        return new pageResponse<>(
                fineDTOs,
                finePage.getNumber(),
                finePage.getSize(),
                finePage.getTotalElements(),
                finePage.getTotalPages(),
                finePage.isLast(),
                finePage.isFirst(),
                finePage.isEmpty()
        );

    }
}
