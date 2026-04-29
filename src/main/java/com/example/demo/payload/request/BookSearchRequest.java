package com.example.demo.payload.request;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class BookSearchRequest {
    private String searchTera;
    private  Long catalogId;
    private Boolean availableOnly;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";


    public String getSearchTera() {
        return null;
    }

    public boolean getAvailableOnly() {
        return true;
    }

    public Long getCatalogId() {
        return (long) 0L;
    }

    public int getSize() {
        return 0;
    }

    public String getSortBy() {
        return null;
    }

    public String getSortDirection() {
        return null;
    }

    public int getPage() {
        return 0;
    }
}
