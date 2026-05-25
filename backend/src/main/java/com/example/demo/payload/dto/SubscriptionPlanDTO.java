package com.example.demo.payload.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
public class SubscriptionPlanDTO {
    private Long id;

    @NotBlank(message = "Plan code is mandatory")
    private String planCode;

    @NotBlank(message = "Plan name is mandatory")
    private String name;

    private String description;

    @NotNull(message = "Duration is mandatory")
    @Positive(message ="Duration must be positive")
    private Integer durationDays;

    @NotNull(message = "Price is mandotory")
    @Min(value = 0, message = "Price must be zero or positive")
    private Long price;

    private String currency;

    @NotNull(message = "Max books allowed is mandatory")
    private Integer maxBooksAllowed;

    @NotNull(message = "Monthly book limit is mandatory")
    @Min(value = -1, message = "Monthly book limit must be -1 or greater")
    private Integer maxBooksPerMonth;

    @NotNull(message = "Concurrent checkout limit is mandatory")
    @Positive(message = "Concurrent checkout limit must be positive")
    private Integer maxConcurrentCheckouts;

    @NotNull(message = "Max days per book is mandatory")
    @Positive(message = "Max days must be positive")
    private Integer maxDaysPerBook;

    @NotNull(message = "Renewals per book is mandatory")
    @Min(value = 0, message = "Renewals per book must be zero or greater")
    private Integer maxRenewalsPerBook;

    private Boolean priorityReservation;

    private Integer displayOrder;

    private Boolean isActive;

    private Boolean isFeatured;

    private String badgeText;

    private String adminNotes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

}
