package com.example.demo.mapper;

import com.example.demo.model.BookReview;
import com.example.demo.payload.dto.BookReviewDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookReviewMapper {
    public BookReviewDTO toDTO(BookReview bookReview) {
        if (bookReview == null) {
            return null;
        }

        return BookReviewDTO.builder()
                .id(bookReview.getId())
                .userId(bookReview.getUser().getId())
                .userName(bookReview.getUser().getFullName())
                .bookId(bookReview.getBook().getId())
                .bookTitle(bookReview.getBook().getTitle())
                .rating(bookReview.getRating())
                .reviewText(bookReview.getReviewText())
                .title(bookReview.getTitle())
                .createdAt(bookReview.getCreatedAt())
                .updatedAt(bookReview.getUpdatedAt())
                .build();
    }
}
