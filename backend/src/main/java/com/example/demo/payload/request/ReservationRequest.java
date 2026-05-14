package com.example.demo.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReservationRequest {
    @NotNull(message = "Book ID is mandatory")
    private Long bookId;

    private String notes;
}
