package com.example.demo.Services;

import com.example.demo.payload.dto.WishlistDTO;
import com.example.demo.payload.response.pageResponse;

public interface WishlistService {

    WishlistDTO addToWishlist(Long bookId, String notes);
    void removeFromWishlist(Long bookId);
    pageResponse<WishlistDTO> getMyWishlist(int page, int size);
}
