package com.example.demo.Services.impl;

import com.example.demo.Services.BookLoanService;
import com.example.demo.Services.SubscriptionService;
import com.example.demo.Services.UserService;
import com.example.demo.domain.BookLoanStatus;
import com.example.demo.domain.BookLoanType;
import com.example.demo.exception.BookException;
import com.example.demo.mapper.BookLoanMapper;
import com.example.demo.model.Book;
import com.example.demo.model.BookLoan;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookLoanServiceImpl implements BookLoanService {
    private final BookLoanRepository bookLoanRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final SubscriptionService subscriptionService;
    private final BookLoanMapper bookLoanMapper;;

    @Override
    public BookLoanDTO checkoutBook(CheckoutRequest checkoutRequest) throws Exception {
        User user = userService.getCurrentUser();
        return checkoutBookForUser(user.getId(), checkoutRequest);
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

        if(bookLoanRepository.hasActiveCheckout(userId, book.getId())){
            throw new BookException("book already has active checkout");
        }

        // 5. check user's active checkout limit
        long activeCheckouts = bookLoanRepository.countActiveBookLoansByUser(userId);
        int maxBooksAllowed = subscription.getMaxBooksAllowed();

        if (activeCheckouts >= maxBooksAllowed) {
            throw new Exception("you have reached your maximum number of books allowed");
        }

        // 6. Check for overdue books
        long overdueCount = bookLoanRepository.countOverdueBookLoansByUser(userId);

        if (overdueCount > 0) {
            throw new Exception("first return old overdue book!");
        }

        // 7. create book loan
        BookLoan bookLoan = BookLoan
                .builder()
                .user(user)
                .book(book)
                .type(BookLoanType.CHECKOUT)
                .status(BookLoanStatus.CHECKED_OUT)
                .checkoutDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(checkoutRequest.getCheckoutDays()))
                .renewalCount(0)
                .maxRenewals(2)
                .notes(checkoutRequest.getNotes())
                .isOverdue(false)
                .overdueDays(0)

                .build();

        // 9. update book available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

// 10. save book loan
        BookLoan savedBookLoan = bookLoanRepository.save(bookLoan);

        return bookLoanMapper.toDTO(savedBookLoan);
    }

    @Override
    public BookLoanDTO checkinBook(CheckinRequest checkinRequest) throws Exception {
        // 1. validate book loan exist
        BookLoan bookLoan = bookLoanRepository.findById(checkinRequest.getBookLoanId())
                .orElseThrow(() -> new Exception("bookloan not found!"));

        // 2. check if already returned
        if (!bookLoan.isActive()) {
            throw new BookException("book loan is not active");
        }

        // 3.set return date
        bookLoan.setReturnDate(LocalDate.now());

        // 4. Determine and set final status
        BookLoanStatus condition = checkinRequest.getCondition();
        if (condition == null) {
            condition = BookLoanStatus.RETURNED;
        }
        bookLoan.setStatus(condition);

        // 5. fine todo
        bookLoan.setOverdueDays(0);
        bookLoan.setIsOverdue(false);

// 6.
        bookLoan.setNotes("book returned by user");

// 7. update book availability
        if (condition != BookLoanStatus.LOST) {
            Book book = bookLoan.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);

            // process next reservation todo
        }

// 8.
        BookLoan savedBookLoan = bookLoanRepository.save(bookLoan);
        return bookLoanMapper.toDTO(savedBookLoan);

    }

    @Override
    public BookLoanDTO renewCheckout(RenewalRequest renewalRequest) throws Exception {
        // 1. validate book loan exist
        BookLoan bookLoan = bookLoanRepository.findById(renewalRequest.getBookLoanId())
                .orElseThrow(() -> new Exception("bookloan not found!"));

// 2. Check if can be renewed
        if (!bookLoan.canRenew()) {
            throw new BookException("book cannot be renewed");
        }
        // update due date
        bookLoan.setDueDate(bookLoan.getDueDate()
                .plusDays(renewalRequest.getExtensionDays()));

        bookLoan.setRenewalCount(bookLoan.getRenewalCount() + 1);

        bookLoan.setNotes("book renewed by user");

        BookLoan savedBookLoan = bookLoanRepository.save(bookLoan);

        return bookLoanMapper.toDTO(savedBookLoan);
    }

    @Override
    public pageResponse<BookLoanDTO> getMyBookLoans(BookLoanStatus status, int page, int size) throws Exception {
        User currentUser = userService.getCurrentUser();
        Page<BookLoan> bookLoanPage;

        if (status != null) {
            // Return only active checkouts, sorted by due date
            Pageable pageable = PageRequest.of(page, size, Sort.by("dueDate").ascending());
            bookLoanPage = bookLoanRepository.findByStatusAndUser(
                    status, currentUser, pageable);
        } else {
            // Return all history (both active and returned), sorted by creation date descending
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            bookLoanPage = bookLoanRepository.findByUserId(currentUser.getId(), pageable);
        }

        return convertToPageResponse(bookLoanPage);
    }

    public pageResponse<BookLoanDTO> getBookLoans(BookLoanSearchRequest searchRequest) throws Exception {
        // 1 Build pageable with sorting, size, etc.
        Pageable pageable = createPageable(
                searchRequest.getPage(),
                searchRequest.getSize(),
                searchRequest.getSortBy(),
                searchRequest.getSortDirection()
        );

        Page<BookLoan> bookLoanPage;

        // 2 Apply filtering logic dynamically
        if (Boolean.TRUE.equals(searchRequest.getOverdueOnly())) {
            // Fetch overdue loans
            bookLoanPage = bookLoanRepository.findOverdueBookLoans(LocalDate.now(), pageable);

        } else if (searchRequest.getUserId() != null) {
            // Fetch loans by specific user
            bookLoanPage = bookLoanRepository.findByUserId(searchRequest.getUserId(), pageable);

        } else if (searchRequest.getBookId() != null) {
            // Fetch loans by specific book
            bookLoanPage = bookLoanRepository.findByBookId(searchRequest.getBookId(), pageable);

        } else if (searchRequest.getStatus() != null) {
            // Fetch loans by loan status
            bookLoanPage = bookLoanRepository.findByStatus(searchRequest.getStatus(), pageable);

        }else if (searchRequest.getStartDate() != null && searchRequest.getEndDate() != null) {
            // Fetch loans within date range
            bookLoanPage = bookLoanRepository.findBookLoansByDateRange(
                    searchRequest.getStartDate(),
                    searchRequest.getEndDate(),
                    pageable
            );
        }

        else {
            // Default: Fetch all (Assumed logic based on typical patterns)
            bookLoanPage = bookLoanRepository.findAll(pageable);
        }

        return convertToPageResponse(bookLoanPage);
    }
    @Override
    public int updateOverdueBookLoan() {
        Pageable pageable = PageRequest.of(0, 1000);
        Page<BookLoan> overduePage = bookLoanRepository.findOverdueBookLoans(LocalDate.now(), pageable);

        int updateCount = 0;
        for (BookLoan bookLoan : overduePage.getContent()) {
            if (bookLoan.getStatus() == BookLoanStatus.CHECKED_OUT) {
                bookLoan.setStatus(BookLoanStatus.OVERDUE);
                bookLoan.setIsOverdue(true);

                int overdueDays = calculateOverdueDate(
                        bookLoan.getDueDate(),
                        LocalDate.now());

                // Calculate fine
//                BigDecimal fine = fineCalculationService.calculateOverdueFine(bookLoan);
                // Note: You might want to save the fine to the bookLoan object here

                bookLoanRepository.save(bookLoan);
                updateCount++;
            }
        }
        return updateCount;
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortDirection) {
        size = Math.min(size, 100);
        size = Math.max(size, 1);

        Sort sort = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return PageRequest.of(page, size, sort);
    }
    private pageResponse<BookLoanDTO> convertToPageResponse(Page<BookLoan> bookLoanPage) {
        List<BookLoanDTO> bookLoanDTOs = bookLoanPage.getContent().stream()
                .map(bookLoan -> bookLoanMapper.toDTO(bookLoan))
                .collect(Collectors.toList());

        return new pageResponse<>(
                bookLoanDTOs,
                bookLoanPage.getNumber(),
                bookLoanPage.getSize(),
                bookLoanPage.getTotalElements(),
                bookLoanPage.getTotalPages(),
                bookLoanPage.isLast(),
                bookLoanPage.isFirst(),
                bookLoanPage.isEmpty()
        );

    }
    public int calculateOverdueDate(LocalDate dueDate, LocalDate today) {
        if (today.isBefore(dueDate) || today.isEqual(dueDate)) {
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(dueDate, today);
    }
}
