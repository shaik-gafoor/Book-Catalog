package com.example.demo.Services;

import com.example.demo.domain.BookLoanStatus;
import com.example.demo.exception.BookException;
import com.example.demo.model.BookLoan;
import com.example.demo.payload.dto.BookLoanDTO;
import com.example.demo.payload.request.BookLoanSearchRequest;
import com.example.demo.payload.request.CheckinRequest;
import com.example.demo.payload.request.CheckoutRequest;
import com.example.demo.payload.request.RenewalRequest;
import com.example.demo.payload.response.pageResponse;

public interface BookLoanService {

    BookLoanDTO checkoutBook(CheckoutRequest checkoutRequest) throws Exception;
    BookLoanDTO checkoutBookForUser(Long userId, CheckoutRequest checkoutRequest) throws Exception;
    BookLoanDTO checkinBook(CheckinRequest checkinRequest) throws Exception;
    BookLoanDTO renewCheckout(RenewalRequest renewalRequest) throws Exception;
    pageResponse<BookLoanDTO> getMyBookLoans(BookLoanStatus status, int page, int size) throws Exception;
    pageResponse<BookLoanDTO> getBookLoans(BookLoanSearchRequest request) throws Exception;
    int updateOverdueBookLoan();
}
