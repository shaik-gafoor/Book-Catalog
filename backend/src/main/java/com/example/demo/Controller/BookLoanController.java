package com.example.demo.Controller;

import com.example.demo.Services.BookLoanService;
import com.example.demo.domain.BookLoanStatus;
import com.example.demo.payload.dto.BookLoanDTO;
import com.example.demo.payload.request.BookLoanSearchRequest;
import com.example.demo.payload.request.CheckinRequest;
import com.example.demo.payload.request.CheckoutRequest;
import com.example.demo.payload.request.RenewalRequest;
import com.example.demo.payload.response.ApiResponse;
import com.example.demo.payload.response.pageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/book-loans")
public class BookLoanController {

    private final BookLoanService bookLoanService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutBook(
            @Valid @RequestBody CheckoutRequest checkoutRequest) throws Exception {

        BookLoanDTO bookLoan = bookLoanService.checkoutBook(checkoutRequest);

        return new ResponseEntity<>(bookLoan, HttpStatus.CREATED);
    }

    @PostMapping("/checkout/user/{userId}")
    public ResponseEntity<?> checkoutBookForUser(
            @PathVariable Long userId,
            @Valid @RequestBody CheckoutRequest checkoutRequest) throws Exception {

        BookLoanDTO bookLoan = bookLoanService
                .checkoutBookForUser(userId, checkoutRequest);

        return new ResponseEntity<>(bookLoan, HttpStatus.CREATED);
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkin(
            @Valid @RequestBody CheckinRequest checkinRequest) throws Exception {

        BookLoanDTO bookLoan = bookLoanService
                .checkinBook(checkinRequest);

        return new ResponseEntity<>(bookLoan, HttpStatus.CREATED);
    }

    @PostMapping("/renew")
    public ResponseEntity<?> renew(
            @Valid @RequestBody RenewalRequest renewalRequest) throws Exception {

        BookLoanDTO bookLoan = bookLoanService
                .renewCheckout(renewalRequest);

        return new ResponseEntity<>(bookLoan, HttpStatus.OK);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookLoans(
            @RequestParam(required = false) BookLoanStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws Exception {

        pageResponse<BookLoanDTO> bookLoans = bookLoanService
                .getMyBookLoans(status, page, size);
        return ResponseEntity.ok(bookLoans);
    }

    @PostMapping("/search")
    public ResponseEntity<?> getAllBookLoans(
            @RequestBody BookLoanSearchRequest searchRequest) throws Exception {

        pageResponse<BookLoanDTO> bookLoans = bookLoanService
                .getBookLoans(searchRequest);

        return ResponseEntity.ok(bookLoans);
    }

    @PostMapping("/admin/update-overdue")
    public ResponseEntity<?> updateOverdueBookLoans() {

        int updateCount = bookLoanService.updateOverdueBookLoan();

        return ResponseEntity.ok(
                new ApiResponse("overduew book loans are updated", true));
    }
}
