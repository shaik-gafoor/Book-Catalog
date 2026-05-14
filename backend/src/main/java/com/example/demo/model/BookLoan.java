package com.example.demo.model;

import com.example.demo.domain.BookLoanStatus;
import com.example.demo.domain.BookLoanType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookLoan {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @JoinColumn(nullable = false)
    @ManyToOne
    private User user;

    @JoinColumn(nullable = false)
    @ManyToOne
    private Book book;

    private BookLoanType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookLoanStatus status;

//    private Boolean isActive;

    @Column(nullable = false)
    private LocalDate checkoutDate;

    private LocalDate dueDate;


    private LocalDate returnDate;

    private Integer renewalCount = 0;

    @Column(nullable = false)
    private Integer maxRenewals = 2;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private Boolean isOverdue = false;

    @Column(nullable = false)
    private Integer overdueDays = 0;



    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean isActive() {
        return status == BookLoanStatus.CHECKED_OUT || status == BookLoanStatus.OVERDUE;
    }

    public boolean canRenew() {
        return status == BookLoanStatus.CHECKED_OUT
                && !isOverdue
                && renewalCount < maxRenewals;
    }
}
