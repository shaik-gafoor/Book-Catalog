package com.example.demo.Controller;

import com.example.demo.Services.BookService;
import com.example.demo.exception.BookException;
import com.example.demo.payload.dto.BookDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/book")
public class AdminBookController {

    private final BookService bookService;

    @PostMapping("/admin")
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO bookDTO) throws BookException {
        BookDTO createdBook = bookService.createdBook(bookDTO);
        return ResponseEntity.ok(createdBook);
    }
}
