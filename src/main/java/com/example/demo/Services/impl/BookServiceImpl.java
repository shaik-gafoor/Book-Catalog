package com.example.demo.Services.impl;

import com.example.demo.Services.BookService;
import com.example.demo.exception.BookException;
import com.example.demo.mapper.BookMapper;
import com.example.demo.model.Book;
import com.example.demo.payload.dto.BookDTO;
import com.example.demo.payload.request.BookSearchRequest;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;



    @Override
    public BookDTO createdBook(BookDTO bookDTO) throws BookException {
        if(bookRepository.existsByIsbn(bookDTO.getIsbn())){
            throw new BookException("book with isdn" +bookDTO.getIsbn()+ "already exists");
        }
        Book book = bookMapper.toEntity(bookDTO);
        book.isAvailableCopesValid();
        Book savedBook = bookRepository.save(book);
        return bookMapper.toDTO(savedBook);
    }


    @Override
    public List<BookDTO> createdBooksBulk(List<BookDTO> bookDTOs) throws BookException {
        List<BookDTO> createdBooks = new ArrayList<>();
        for(BookDTO bookDTO:bookDTOs){
            BookDTO book = createdBook(bookDTO);
            createdBooks.add(book);
        }
        return createdBooks;
    }



    @Override
    public BookDTO getBookById(Long bookId) throws BookException {
        Book book =  bookRepository.findById(bookId)
                .orElseThrow(() -> new BookException("Book not found"));
        return bookMapper.toDTO(book);
    }

    @Override
    public BookDTO getBookByISBN(String isbn) throws BookException {
        Book book =  bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new BookException("Book not found"));
        return bookMapper.toDTO(book);
    }

    @Override
    public BookDTO updateBook(Long bookId, BookDTO bookDTO) throws BookException {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookException("Book Not Found!"));
        bookMapper.updateEntityFromDTO(bookDTO,existingBook);
        existingBook.isAvailableCopesValid();
        Book savedBook = bookRepository.save(existingBook);
        return bookMapper.toDTO(savedBook);

    }

    @Override
    public void deleteBook(Long bookId) throws BookException {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookException("Book Not Found!"));
        existingBook.setActive(false);
        bookRepository.save(existingBook);

    }

    @Override
    public void hardDeleteBook(Long bookId) throws BookException {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookException("Book Not Found!"));
        bookRepository.delete(existingBook);
    }

    @Override
    public pageResponse<BookDTO> searchBooksWithFilters(BookSearchRequest searchRequest) {
        Pageable pageable = createPageable(searchRequest.getPage(),
                searchRequest.getSize(),
                searchRequest.getSortBy(),
                searchRequest.getSortDirection()
                );
        Page<Book> bookPage = bookRepository.searchBooksWithFilters(
                searchRequest.getSearchTera(),
                searchRequest.getCatalogId(),
                searchRequest.getAvailableOnly(),
                pageable
        );
        return convertToPageResponse(bookPage);
    }

    @Override
    public long getTotalActiveBooks() {
        return bookRepository.countByActiveTrue();
    }

    @Override
    public long getTotalAvailailableBooks() {
        return bookRepository.countAvailableBooks();
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortDirection){
        size = Math.min(size,10);
        size = Math.max(size,1);

        Sort sort = sortDirection.equalsIgnoreCase("ASC")
                ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
        return PageRequest.of(page,size,sort);
    }

    private  pageResponse<BookDTO> convertToPageResponse(Page<Book> books){
        List<BookDTO> bookDTOS = books.getContent()
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());

        return new pageResponse<>(bookDTOS,
                books.getNumber(),
                books.getSize(),
                books.getTotalElements(),
                books.getTotalPages(),
                books.isLast(),
                books.isFirst(),
                books.isEmpty());
    }
}
