package com.example.demo.Services;

import com.example.demo.payload.dto.ReservationDTO;
import com.example.demo.payload.request.ReservationRequest;
import com.example.demo.payload.request.ReservationSearchRequest;
import com.example.demo.payload.response.pageResponse;

public interface ReservationService {
    ReservationDTO createReservation(ReservationRequest reservationRequest);

    ReservationDTO createReservationForUser(ReservationRequest reservationRequest, Long userId) throws Exception;

    ReservationDTO cancelReservation(Long reservationId) throws Exception;

    ReservationDTO fulfillReservation(Long reservationId) throws Exception;

    pageResponse<ReservationDTO> getMyReservations(ReservationSearchRequest searchRequest);

    pageResponse<ReservationDTO> searchReservations(ReservationSearchRequest searchRequest);
}
