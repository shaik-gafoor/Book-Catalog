package com.example.demo.Services;

import com.example.demo.payload.dto.BookReviewDTO;
import com.example.demo.payload.request.CreateReviewRequest;
import com.example.demo.payload.request.UpdateReviewRequest;
import com.example.demo.payload.response.pageResponse;

public interface BookReviewService {
    BookReviewDTO createReview(CreateReviewRequest request) throws Exception;
    BookReviewDTO updateReview(Long reviewId, UpdateReviewRequest request) throws Exception;
    void deleteReview(Long reviewId) throws Exception;
    pageResponse<BookReviewDTO> getReviewByBookId(Long id, int page, int size) throws Exception;



}
