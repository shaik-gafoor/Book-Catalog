package com.example.demo.repository;

import com.example.demo.domain.BookLoanStatus;
import com.example.demo.model.BookLoan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {
    Page<BookLoan> findByUserId(Long userId, Pageable pageable);
    Page<BookLoan> findByUserIdAndStatus(Long userId, BookLoanStatus status, Pageable pageable);
    Page<BookLoan> findByStatus(BookLoanStatus status, Pageable pageable);
    @Query("select case when count(bl) > 0 then true else false end from BookLoan bl " +
            "where bl.user.id = :userId and bl.book.id = :bookId " +
            "and (bl.status = 'CHECKED_OUT' OR bl.status = 'OVERDUE')"
    )
    boolean hasActiveCheckout(
            @Param("userId") Long userId,
            @Param("bookId") Long bookId
    );
}
