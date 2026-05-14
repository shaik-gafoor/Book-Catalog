package com.example.demo.Services.impl;

import com.example.demo.Services.BookReviewService;
import com.example.demo.Services.UserService;
import com.example.demo.domain.BookLoanStatus;
import com.example.demo.mapper.BookReviewMapper;
import com.example.demo.model.Book;
import com.example.demo.model.BookLoan;
import com.example.demo.model.BookReview;
import com.example.demo.model.User;
import com.example.demo.payload.dto.BookReviewDTO;
import com.example.demo.payload.request.CreateReviewRequest;
import com.example.demo.payload.request.UpdateReviewRequest;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookLoanRepository;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.BookReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookReviewServiceImpl implements BookReviewService {

    private final BookReviewRepository bookReviewRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final BookReviewMapper bookReviewMapper;
    private final BookLoanRepository bookLoanRepository;

    @Override
    public BookReviewDTO createReview(CreateReviewRequest request) throws Exception {

//         1. fetch the logged user
        User user = userService.getCurrentUser();

// 2. validate book exist
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new Exception("book not found!"));
//        3. check if user has already reviewed the book
        if(bookReviewRepository.existsByUserIdAndBookId(user.getId(), book.getId())){
            throw new Exception("you have already reviewed this book!");
        }

// 4. check if user has read the book
        boolean hasReadBook = hasUserReadBook(user.getId(), book.getId());
        if (!hasReadBook) {
            throw new Exception("you have not read this book!");
        }

// 5. create review
        BookReview bookReview = new BookReview();
        bookReview.setUser(user);
        bookReview.setBook(book);
        bookReview.setRating(request.getRating());
        bookReview.setReviewText(request.getReviewText());
        bookReview.setTitle(request.getTitle());

        BookReview savedBookReview = bookReviewRepository.save(bookReview);
        return bookReviewMapper.toDTO(savedBookReview);
    }


    @Override
    public BookReviewDTO updateReview(Long reviewId, UpdateReviewRequest request) throws Exception {
        // 1. fetch logged user
        User user = userService.getCurrentUser();

// 2. find the review
        BookReview bookReview = bookReviewRepository.findById(reviewId)
                .orElseThrow(() -> new Exception("review not found!"));

// 2. check if logged user is the owner of the review
        if(!bookReview.getUser().getId().equals(user.getId())){
            throw new Exception("you have not reviewed this book!");
        }

        // 3. update review
        bookReview.setReviewText(request.getReviewText());
        bookReview.setTitle(request.getTitle());
        bookReview.setRating(request.getRating());

        BookReview savedBookReview = bookReviewRepository.save(bookReview);
        return bookReviewMapper.toDTO(savedBookReview);
    }

    @Override
    public void deleteReview(Long reviewId) throws Exception {
        User user = userService.getCurrentUser();
        // 1. Find the review
        BookReview bookReview = bookReviewRepository.findById(reviewId)
                .orElseThrow(() -> new Exception("Review not found with id: " + reviewId));

// 2. Check if current user is the owner of the review
        if (!bookReview.getUser().getId().equals(userService.getCurrentUser().getId())) {
            throw new Exception("You can only delete your own reviews");
        }

// 3. Soft delete (mark as inactive)
        bookReviewRepository.delete(bookReview);
    }

    @Override
    public pageResponse<BookReviewDTO> getReviewByBookId(Long id, int page, int size) throws Exception {
        Book book = bookRepository.findById(id).orElseThrow(
                () -> new Exception("book not found by id!")
        );

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());

        Page<BookReview> pageBookReview = bookReviewRepository.findByBook(book, pageable);
        return convertToPageResponse(pageBookReview);
    }

    private pageResponse<BookReviewDTO> convertToPageResponse(Page<BookReview> reviewPage) {
        List<BookReviewDTO> reviewDTOs = reviewPage.getContent()
                .stream()
                .map(bookReviewMapper::toDTO)
                .collect(Collectors.toList());

        return new pageResponse<>(
                reviewDTOs,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast(),
                reviewPage.isFirst(),
                reviewPage.isEmpty()
        );
    }

    private boolean hasUserReadBook(Long userId, Long bookId) {
        List<BookLoan> bookLoans = bookLoanRepository.findByBookId(bookId);

        return bookLoans.stream()
                .anyMatch(loan -> loan.getUser().getId().equals(userId) &&
                        loan.getStatus() == BookLoanStatus.RETURNED);
    }
}
