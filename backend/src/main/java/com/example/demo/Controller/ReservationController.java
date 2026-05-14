package com.example.demo.Controller;

import com.example.demo.Services.ReservationService;
import com.example.demo.domain.ReservationStatus;
import com.example.demo.exception.BookException;
import com.example.demo.exception.UserException;
import com.example.demo.payload.dto.ReservationDTO;
import com.example.demo.payload.request.ReservationRequest;
import com.example.demo.payload.request.ReservationSearchRequest;
import com.example.demo.payload.response.ApiResponse;
import com.example.demo.payload.response.pageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping()
    public ResponseEntity<?> createReservation(
            @Valid @RequestBody ReservationRequest reservationRequest
    ) throws Exception {
        ReservationDTO reservationDTO = reservationService
                .createReservation(reservationRequest);
        return ResponseEntity.ok(reservationDTO);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createReservationForUser(
            @PathVariable Long userId,
            @Valid @RequestBody ReservationRequest reservationRequest) throws Exception {

        ReservationDTO reservation = reservationService
                .createReservationForUser(reservationRequest,userId);
        return new ResponseEntity<>(reservation, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) throws Exception {
            ReservationDTO reservation = reservationService.cancelReservation(id);
            return ResponseEntity.ok(reservation);
    }

    @PostMapping("/{id}/fulfill")
    public ResponseEntity<?> fulfillReservation(@PathVariable Long id)
            throws Exception, Exception {
            ReservationDTO reservation = reservationService.fulfillReservation(id);
            return ResponseEntity.ok(reservation);

    }

    @GetMapping("/my")
    public ResponseEntity<pageResponse<ReservationDTO>> getMyReservations(
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "reservedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) throws Exception {

        ReservationSearchRequest searchRequest = new ReservationSearchRequest();
        searchRequest.setStatus(status);
        searchRequest.setActiveOnly(activeOnly);
        searchRequest.setPage(page);
        searchRequest.setSize(size);
        searchRequest.setSortBy(sortBy);
        searchRequest.setSortDirection(sortDirection);

        pageResponse<ReservationDTO> reservations = reservationService.getMyReservations(searchRequest);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping
    public ResponseEntity<pageResponse<ReservationDTO>> searchReservations(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "reservedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        ReservationSearchRequest searchRequest = new ReservationSearchRequest();

        searchRequest.setUserId(userId);
        searchRequest.setBookId(bookId);
        searchRequest.setStatus(status);
        searchRequest.setActiveOnly(activeOnly);
        searchRequest.setPage(page);
        searchRequest.setSize(size);
        searchRequest.setSortBy(sortBy);
        searchRequest.setSortDirection(sortDirection);

        pageResponse<ReservationDTO> reservations = reservationService.searchReservations(searchRequest);

        return ResponseEntity.ok(reservations);
    }

}
