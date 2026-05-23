package com.example.demo.mapper;

import com.example.demo.exception.BookException;
import com.example.demo.model.Book;
import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.BookDTO;
import com.example.demo.payload.dto.CatalogDTO;
import com.example.demo.repository.CatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookMapper {

    private final CatalogRepository catalogRepository;
    public BookDTO toDTO(Book book){
        if(book == null){
            return null;
        }
        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .catalogName(book.getCatalog().getName())
                .catalogCode(book.getCatalog().getCode())
                .catalogId(book.getCatalog().getId())
                .publisher(book.getPublisher())
                .publicationDate(book.getPublisheddate())
                .language(book.getLanguage())
                .pages(book.getPages())
                .description(book.getDescription())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .price(book.getPrice())
                .coverImagesUrl(book.getCoverImageUrl())
                .active(book.getActive())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }

    public Book toEntity(BookDTO dto) throws BookException {
        if(dto == null){
            return null;
        }
        Book book = new Book();
        book.setId(dto.getId());
        book.setIsbn(dto.getIsbn());
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());

        if(dto.getCatalogId() != null){
            Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                    .orElseThrow(() -> new BookException("Catalog with ID"+ dto.getCatalogId() + " Not Found "));
            book.setCatalog(catalog);
        }

        book.setPublisher(dto.getPublisher());
        book.setPublisheddate(dto.getPublicationDate());
        book.setLanguage(dto.getLanguage());
        book.setPages(dto.getPages());
        book.setDescription(dto.getDescription());
        book.setTotalCopies(dto.getTotalCopies());
        book.setAvailableCopies(dto.getAvailableCopies());
        book.setPrice(dto.getPrice());
        book.setCoverImageUrl(dto.getCoverImagesUrl());
        book.setActive(true);

        return book;
    }

    public void updateEntityFromDTO(BookDTO dto, Book book) throws BookException {
        if (dto == null || book == null) {
            return;
        }

        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());

        if (dto.getCatalogId() != null) {
            Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                    .orElseThrow(() -> new BookException("Catalog with ID" + dto.getCatalogId() + ""));
            book.setCatalog(catalog);
        }

        book.setPublisher(dto.getPublisher());
        book.setPublisheddate(dto.getPublicationDate());
        book.setLanguage(dto.getLanguage());
        book.setPages(dto.getPages());
        book.setDescription(dto.getDescription());
        book.setTotalCopies(dto.getTotalCopies());
        book.setAvailableCopies(dto.getAvailableCopies());
        book.setPrice(dto.getPrice());
        book.setCoverImageUrl(dto.getCoverImagesUrl());

        if (dto.getActive() != null) {
            book.setActive(dto.getActive());
        }
    }
}
