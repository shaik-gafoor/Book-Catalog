package com.example.demo.Services;

import com.example.demo.payload.dto.BookDTO;
import com.example.demo.payload.request.BookSearchRequest;
import com.example.demo.payload.response.pageResponse;

import java.util.List;

public interface BookService {

    BookDTO createdBook(BookDTO bookDTO);
    List<BookDTO> createdBooksBulk();
    BookDTO getBookById(Long bookId);
    BookDTO getBookByISBN(String title);
    BookDTO updateBook(Long bookId, BookDTO bookDTO);
    void deleteBook(Long bookId);
    void hardDeleteBook(Long bookId);

    pageResponse<BookDTO> searchBooksWithFilters(
            BookSearchRequest searchRequest
    );

    long getTotalActiveBooks();
    long getTotalAvailailableBooks();
}

