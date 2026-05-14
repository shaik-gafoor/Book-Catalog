package com.example.demo.payload.request;

import com.example.demo.domain.ReservationStatus;

import lombok.*;


@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationSearchRequest {
    private Long userId;

    // Book filter
    private Long bookId;

    // Status filter
    private ReservationStatus status;

    // Active only (PENDING or AVAILABLE)
    private Boolean activeOnly;

    // Pagination
    private int page = 0;
    private int size = 20;

    // Sorting
    private String sortBy = "reservedAt"; // reservedAt, availableAt, ...
    private String sortDirection = "DESC"; // ASC or DESC
}
