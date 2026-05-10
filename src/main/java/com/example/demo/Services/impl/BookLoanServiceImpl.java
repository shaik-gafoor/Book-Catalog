package com.example.demo.Services.impl;

import com.example.demo.Services.BookLoanService;
import com.example.demo.Services.SubscriptionService;
import com.example.demo.Services.UserService;
import com.example.demo.domain.BookLoanStatus;
import com.example.demo.exception.BookException;
import com.example.demo.model.Book;
import com.example.demo.model.User;
import com.example.demo.payload.dto.BookLoanDTO;
import com.example.demo.payload.dto.SubscriptionDTO;
import com.example.demo.payload.request.BookLoanSearchRequest;
import com.example.demo.payload.request.CheckinRequest;
import com.example.demo.payload.request.CheckoutRequest;
import com.example.demo.payload.request.RenewalRequest;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookLoanRepository;
import com.example.demo.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookLoanServiceImpl implements BookLoanService {
    private final BookLoanRepository bookLoanRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final SubscriptionService subscriptionService;

    @Override
    public BookLoanDTO checkoutBook(CheckoutRequest checkoutRequest) {
        return null;
    }

    @Override
    public BookLoanDTO checkoutBookForUser(Long userId, CheckoutRequest checkoutRequest) throws Exception {
        // 1. validate user exist
        User user = userService.findById(userId);

// 2. validate user has active subscription
        SubscriptionDTO subscription = subscriptionService
                .getUsersActiveSubscription(user.getId());

// 3. validate book exists and is available
        Book book = bookRepository.findById(checkoutRequest.getBookId())
                .orElseThrow(() -> new BookException("book not found with id " + checkoutRequest.getBookId()));

        if(!book.getActive()){
            throw new BookException("book is not active");
        }

        if(book.getAvailableCopies() <= 0) {
            throw new BookException("Book is not available");
        }
    }

    @Override
    public BookLoanDTO checkinBook(CheckinRequest checkinRequest) {
        return null;
    }

    @Override
    public BookLoanDTO renewCheckout(RenewalRequest renewalRequest) {
        return null;
    }

    @Override
    public pageResponse<BookLoanDTO> getMyBookLoans(BookLoanStatus status, int page, int size) {
        return null;
    }

    @Override
    public pageResponse<BookLoanDTO> getBookLoans(BookLoanSearchRequest request) {
        return null;
    }

    @Override
    public int updateOverdueBookLoan() {
        return 0;
    }
}
