package com.example.demo.repository;

import com.example.demo.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface  BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);


    //book - java programming
    //java


    @Query("SELECT b FROM Book b WHERE " +
            "(:searchTerm IS NULL OR " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND (:catalogId IS NULL OR b.catalog.id = :catalogId) " +
            "AND (:availableOnly = false OR b.availableCopies > 0) " +
            "AND b.active = true")
    Page<Book> searchBooksWithFilters(
            @Param("searchTerm") String searchTerm,
            @Param("catalogId") Long catalogId,   // ✅ FIXED
            @Param("availableOnly") boolean availableOnly,
            Pageable pageable
    );

    long countByActiveTrue();
    @Query("select count(b) from Book b where b.availableCopies>0 and b.active=true")
    long countAvailableBooks();
}
