package com.example.demo.Services;

import com.example.demo.exception.BookException;
import com.example.demo.payload.dto.BookDTO;
import com.example.demo.payload.request.BookSearchRequest;
import com.example.demo.payload.response.pageResponse;

import java.util.List;

public interface BookService {

    BookDTO createdBook(BookDTO bookDTO) throws BookException;
    List<BookDTO> createdBooksBulk(List<BookDTO> bookDTOs) throws BookException;
    BookDTO getBookById(Long bookId) throws BookException;
    BookDTO getBookByISBN(String title) throws BookException;
    BookDTO updateBook(Long bookId, BookDTO bookDTO) throws BookException;
    void deleteBook(Long bookId) throws BookException;
    void hardDeleteBook(Long bookId) throws BookException;

    pageResponse<BookDTO> searchBooksWithFilters(
            BookSearchRequest searchRequest
    );

    long getTotalActiveBooks();
    long getTotalAvailailableBooks();
}

