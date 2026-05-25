package com.example.demo.Services.impl;

import com.example.demo.Services.BookLoanService;
import com.example.demo.Services.ReservationService;
import com.example.demo.Services.SubscriptionService;
import com.example.demo.Services.UserService;
import com.example.demo.domain.BookLoanStatus;
import com.example.demo.domain.ReservationStatus;
import com.example.demo.domain.UserRole;
import com.example.demo.mapper.ReservationMapper;
import com.example.demo.model.Book;
import com.example.demo.model.Reservation;
import com.example.demo.model.User;
import com.example.demo.payload.dto.SubscriptionDTO;
import com.example.demo.payload.dto.ReservationDTO;
import com.example.demo.payload.request.CheckoutRequest;
import com.example.demo.payload.request.ReservationRequest;
import com.example.demo.payload.request.ReservationSearchRequest;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookLoanRepository;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final BookLoanRepository bookLoanRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final BookLoanService bookLoanService;
    private final SubscriptionService subscriptionService;

    int MAX_RESERVATIONS = 5;

    @Override
    public ReservationDTO createReservation(ReservationRequest reservationRequest) throws Exception {
        User user = userService.getCurrentUser();
        return createReservationForUser(reservationRequest, user.getId());
    }

    @Override
    public ReservationDTO createReservationForUser(ReservationRequest reservationRequest, Long userId) throws Exception {
        SubscriptionDTO subscription = subscriptionService.getUsersActiveSubscription(userId);
        String planCode = subscription != null && subscription.getPlanCode() != null ? subscription.getPlanCode() : "FREE";

        if ("FREE".equalsIgnoreCase(planCode)) {
            throw new Exception("Reservations are not available on the Free plan. Upgrade to Basic or Premium to reserve books.");
        }

        boolean alreadyHasLoan = bookLoanRepository.existsByUserIdAndBookIdAndStatus(
                userId, reservationRequest.getBookId(), BookLoanStatus.CHECKED_OUT
        );

        if (alreadyHasLoan) {
            throw new Exception("you already have loan on this book");
        }

// 1. validate user exist
        User user = userService.findById(userId);

// 2. validate book exist
        Book book = bookRepository.findById(reservationRequest.getBookId())
                .orElseThrow(() -> new Exception("book not found"));
//3
        if (reservationRepository.hasActiveReservation(userId, book.getId())) {
            throw new Exception("you have already reservation on this book");
        }

// 5. check user's active reservation limit
        long activeReservations = reservationRepository
                .countActiveReservationsByUser(userId);
        if (activeReservations >= MAX_RESERVATIONS) {
            throw new Exception("you have reserved " + MAX_RESERVATIONS + " times");
        }
        boolean priorityReservation = "PREMIUM".equalsIgnoreCase(planCode);
// 6. create reservation
        // 6. create reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setReservedAt(LocalDateTime.now());
        reservation.setNotificationSent(false);
        reservation.setNotes(reservationRequest.getNotes());
        reservation.setPriority(priorityReservation);

        boolean bookCurrentlyAvailable = book.getAvailableCopies() != null
                && book.getAvailableCopies() > 0;

        if (bookCurrentlyAvailable) {
            reservation.setStatus(ReservationStatus.AVAILABLE);
            reservation.setAvailableAt(LocalDateTime.now());
            reservation.setAvailableUntil(LocalDateTime.now().plusDays(3));
            reservation.setQueuePosition(0);
        } else {
            reservation.setStatus(ReservationStatus.PENDING);

            long pendingCount = priorityReservation
                ? reservationRepository.countPendingPriorityReservationsByBook(book.getId())
                : reservationRepository.countPendingReservationsByBook(book.getId());

            reservation.setQueuePosition((int) pendingCount + 1);
        }

        Reservation savedReservation = reservationRepository.save(reservation);

        return reservationMapper.toDTO(savedReservation);
    }

    @Override
    public ReservationDTO cancelReservation(Long reservationId) throws Exception {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new Exception("Reservation not found with ID: " + reservationId));
        // Verify current user owns this reservation (unless admin)
        User currentUser = userService.getCurrentUser();
        if (
                !reservation.getUser().getId().equals(currentUser.getId())
                        && !UserRole.ROLE_ADMIN.equals(currentUser.getRole())
        ) {
            throw new Exception("You can only cancel your own reservations");
        }
        if (!reservation.canBeCancelled()) {
            throw new Exception("Reservation cannot be cancelled (current status: " + reservation.getStatus() + ")");
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(LocalDateTime.now());
        Reservation savedReservation = reservationRepository.save(reservation);
        // Update queue positions for remaining reservations
        //updateQueuePositions(reservation.getBook().getId());
        //logger.info("Reservation {} cancelled by user {}", reservationId, currentUser.getId());
        return reservationMapper.toDTO(savedReservation);
    }

    @Override
    public ReservationDTO fulfillReservation(Long reservationId) throws Exception {
        // 1. Fetch the reservation or throw an exception if not found
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new Exception("Reservation not found with ID: " + reservationId));
        // 2. Check if there are available copies of the book
        if (reservation.getBook().getAvailableCopies() <= 0) {
            throw new Exception("Reservation is not available for pickup (current inventory is 0)");
        }
        // 3. Update the reservation status and fulfillment time
        reservation.setStatus(ReservationStatus.FULFILLED);
        reservation.setFulfilledAt(LocalDateTime.now());
        // 4. Persist the changes
        Reservation savedReservation = reservationRepository.save(reservation);
//        logger.info("Reservation {} fulfilled", reservationId);
        // 5. Prepare a checkout request to link the book to the user
        CheckoutRequest request = new CheckoutRequest();
        request.setBookId(reservation.getBook().getId());
        request.setNotes("Assign Booked by Admin");
        // 6. Trigger the book loan service to complete the checkout
        bookLoanService.checkoutBookForUser(reservation.getUser().getId(), request);
        // 7. Map the entity back to a DTO for the response
        return reservationMapper.toDTO(savedReservation);
    }

    @Override
    public pageResponse<ReservationDTO> getMyReservations(ReservationSearchRequest searchRequest) throws Exception {
        User user = userService.getCurrentUser();
        searchRequest.setUserId(user.getId());
        return searchReservations(searchRequest);
    }

    @Override
    public pageResponse<ReservationDTO> searchReservations(ReservationSearchRequest searchRequest) {
        // Generate pagination and sorting configuration
        Pageable pageable = createPageable(searchRequest);

        // Query the database using multiple filters
        Page<Reservation> reservationPage = reservationRepository
                .searchReservationsWithFilters(
                        searchRequest.getUserId(),
                        searchRequest.getBookId(),
                        searchRequest.getStatus(),
                        searchRequest.getActiveOnly() != null ? searchRequest.getActiveOnly() : false,
                        pageable
                );

        // Map the database page results to a structured PageResponse
        return buildPageResponse(reservationPage);
    }
    private pageResponse<ReservationDTO> buildPageResponse(Page<Reservation> reservationPage) {
        // Convert entity list to DTO list using Java Streams
        List<ReservationDTO> dtos = reservationPage.getContent().stream()
                .map(reservationMapper::toDTO)
                .toList();

        // Create and populate the custom response object
        pageResponse<ReservationDTO> response = new pageResponse<>();
        response.setContent(dtos);
        response.setPageNumber(reservationPage.getNumber());
        response.setPageSize(reservationPage.getSize());
        response.setTotalElements(reservationPage.getTotalElements());
        response.setTotalPages(reservationPage.getTotalPages());
        response.setLast(reservationPage.isLast());

        return response;
    }
    private Pageable createPageable(ReservationSearchRequest searchRequest) {
        // Determine sort direction (ASC vs DESC) based on the request
        Sort sort = "ASC".equalsIgnoreCase(searchRequest.getSortDirection())
                ? Sort.by(searchRequest.getSortBy()).ascending()
                : Sort.by(searchRequest.getSortBy()).descending();

        // Return a PageRequest containing the page index, page size, and sort configuration
        return PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
    }
}
