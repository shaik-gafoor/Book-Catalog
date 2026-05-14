package com.example.demo.domain;

public enum BookLoanType {
    /**
     * Regular checkout (book loan initiated)
     */
    CHECKOUT,

/**
 * Book renewal (extending due date)
 */
    RENEWAL,

/**
 * Book return (check-in)
 */
    RETURN
}
