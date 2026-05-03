package com.example.demo.Controller;

import com.example.demo.Services.BookService;
import com.example.demo.exception.BookException;
import com.example.demo.payload.dto.BookDTO;
import com.example.demo.payload.request.BookSearchRequest;
import com.example.demo.payload.response.ApiResponse;
import com.example.demo.payload.response.pageResponse;
import jakarta.validation.Valid;
import jdk.jshell.spi.ExecutionControl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;


    @PostMapping
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO bookDTO) throws BookException {
        BookDTO createdBook = bookService.createdBook(bookDTO);
        return ResponseEntity.ok(createdBook);
    }


    @PostMapping("/bulk")
    public ResponseEntity<BookDTO> createBooksBulk(@Valid @RequestBody List<BookDTO> bookDTOS) throws BookException {
        List<BookDTO> createdBooks = bookService.createdBooksBulk(bookDTOS);
        return ResponseEntity.ok((BookDTO) createdBooks);
    }


    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) throws BookException, ExecutionControl.UserException{
        BookDTO book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    @PutMapping("/{id")
    public ResponseEntity<BookDTO> updateBook(@PathVariable Long id, @RequestBody BookDTO bookDTO) throws BookException {
            BookDTO updatedBook = bookService.updateBook(id, bookDTO);
            return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteBook(@PathVariable Long id) throws BookException {
        bookService.deleteBook(id);
        return ResponseEntity.ok(new ApiResponse("Book deleted successfully",true));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<ApiResponse> hardDeleteBook(
            @PathVariable Long id
    ) throws BookException {
        bookService.hardDeleteBook(id);
        return ResponseEntity.ok(new ApiResponse("Book permanently deleted",true));
    }

    @GetMapping
    public ResponseEntity<pageResponse<BookDTO>> searchBooks(
            @RequestParam(required = false) Long catalogId,
            @RequestParam(required = false, defaultValue = "false") Boolean availableOnly,
            @RequestParam(defaultValue = "true") boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ){

        BookSearchRequest searchRequest = new BookSearchRequest();
        searchRequest.setCatalogId(catalogId);
        searchRequest.setAvailableOnly(availableOnly);
//        searchRequest.set
        searchRequest.setPage(page);
        searchRequest.setSize(size);
        searchRequest.setSortBy(sortBy);
        searchRequest.setSortDirection(sortDirection);

        pageResponse<BookDTO> books = bookService.searchBooksWithFilters(searchRequest);
        return ResponseEntity.ok(books);
    }

    @PostMapping("/search")
    public ResponseEntity<pageResponse<BookDTO>> advancedSearch(@RequestBody BookSearchRequest searchRequest){
        pageResponse<BookDTO> books = bookService.searchBooksWithFilters(searchRequest);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/status")
    public ResponseEntity<BookStatusResponse> getBookStatus(){
        long totalActive = bookService.getTotalActiveBooks();
        long totalAvailable = bookService.getTotalAvailailableBooks();

        BookStatusResponse status = new BookStatusResponse(totalActive, totalAvailable);
        return ResponseEntity.ok(status);
    }


    public static class BookStatusResponse{
        public long totalActiveBooks;
        public long totalAvailableBooks;

        public BookStatusResponse(long totalActiveBooks, long totalAvailableBooks){
            this.totalActiveBooks = totalActiveBooks;
            this.totalAvailableBooks = totalAvailableBooks;
        }
    }

}
