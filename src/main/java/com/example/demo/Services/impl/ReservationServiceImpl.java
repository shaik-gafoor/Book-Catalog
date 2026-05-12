package com.example.demo.Services.impl;

import com.example.demo.Services.ReservationService;
import com.example.demo.Services.UserService;
import com.example.demo.domain.BookLoanStatus;
import com.example.demo.domain.ReservationStatus;
import com.example.demo.mapper.ReservationMapper;
import com.example.demo.model.Book;
import com.example.demo.model.Reservation;
import com.example.demo.model.User;
import com.example.demo.payload.dto.ReservationDTO;
import com.example.demo.payload.request.ReservationRequest;
import com.example.demo.payload.request.ReservationSearchRequest;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookLoanRepository;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final BookLoanRepository bookLoanRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;

    int MAX_RESERVATIONS = 5;

    @Override
    public ReservationDTO createReservation(ReservationRequest reservationRequest) {
        return null;
    }

    @Override
    public ReservationDTO createReservationForUser(ReservationRequest reservationRequest, Long userId) throws Exception {
        boolean alreadyHasLoan = bookLoanRepository.existsByUserIdAndBookIdAndStatus(
                userId, reservationRequest.getBookId(), BookLoanStatus.CHECKED_OUT
        );

        if (alreadyHasLoan) {
            throw new Exception("you already have loan on this book");
        }

// 1. validate user exist
        User user = userService.getCurrentUser();

// 2. validate book exist
        Book book = bookRepository.findById(reservationRequest.getBookId())
                .orElseThrow(() -> new Exception("book not found"));
//3
        if (reservationRepository.hasActiveReservation(userId, book.getId())) {
            throw new Exception("you have already reservation on this book");
        }
// 4. Check if book is already available
        if (book.getAvailableCopies() > 0) {
            throw new Exception("book is already available");
        }

// 5. check user's active reservation limit
        long activeReservations = reservationRepository
                .countActiveReservationsByUser(userId);
        if (activeReservations >= MAX_RESERVATIONS) {
            throw new Exception("you have reserved " + MAX_RESERVATIONS + " times");
        }
// 6. create reservation
        // 6. create reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setReservedAt(LocalDateTime.now());
        reservation.setNotificationSent(false);
        reservation.setNotes(reservationRequest.getNotes());

        long pendingCount = reservationRepository.countPendingReservationsByBook(
                book.getId()
        );

        reservation.setQueuePosition((int) pendingCount + 1);

        Reservation savedReservation = reservationRepository.save(reservation);

        return reservationMapper.toDTO(savedReservation);
    }

    @Override
    public ReservationDTO cancelReservation(Long reservationId) {
        return null;
    }

    @Override
    public ReservationDTO fulfillReservation(Long reservationId) {
        return null;
    }

    @Override
    public pageResponse<ReservationDTO> getMyReservations(ReservationSearchRequest searchRequest) {
        return null;
    }

    @Override
    public pageResponse<ReservationDTO> searchReservations(ReservationSearchRequest searchRequest) {
        return null;
    }
}
