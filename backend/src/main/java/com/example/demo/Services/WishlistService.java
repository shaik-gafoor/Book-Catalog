package com.example.demo.Services;

import com.example.demo.payload.dto.WishlistDTO;
import com.example.demo.payload.response.pageResponse;

public interface WishlistService {

    WishlistDTO addToWishlist(Long bookId, String notes) throws Exception;
    void removeFromWishlist(Long bookId) throws Exception;
    pageResponse<WishlistDTO> getMyWishlist(int page, int size) throws Exception;
    pageResponse<WishlistDTO> getWishlists(Long userId, int page, int size) throws Exception;
}
