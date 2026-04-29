package com.example.demo.payload.request;

public class BookSearchRequest {
    private String searchTera;
    private  Long catalogId;
    private Boolean availableOnly;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}
