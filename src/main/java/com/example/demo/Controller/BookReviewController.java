package com.example.demo.Controller;

import com.example.demo.Services.BookReviewService;
import com.example.demo.payload.dto.BookReviewDTO;
import com.example.demo.payload.request.CreateReviewRequest;
import com.example.demo.payload.request.UpdateReviewRequest;
import com.example.demo.payload.response.ApiResponse;
import com.example.demo.payload.response.pageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/reviews")
public class BookReviewController {

    private final BookReviewService bookReviewService;

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest request
    ) throws Exception {
        BookReviewDTO reviewDTO = bookReviewService.createReview(request);
        return ResponseEntity.ok(reviewDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(
            @Valid
            @PathVariable Long id,
            @RequestBody UpdateReviewRequest request
    ) throws Exception {
        BookReviewDTO reviewDTO = bookReviewService.updateReview(id, request);
        return ResponseEntity.ok(reviewDTO);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) throws Exception {

        bookReviewService.deleteReview(reviewId);
        return ResponseEntity.ok(
                new ApiResponse("Review deleted successfully", true));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<pageResponse<BookReviewDTO>> getReviewsByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws Exception {
        pageResponse<BookReviewDTO> reviews = bookReviewService
                .getReviewByBookId(bookId, page, size);
        return ResponseEntity.ok(reviews);
    }
}
