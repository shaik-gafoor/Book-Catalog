package com.example.demo.Controller;

import com.example.demo.Services.WishlistService;
import com.example.demo.payload.dto.WishlistDTO;
import com.example.demo.payload.response.ApiResponse;
import com.example.demo.payload.response.pageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/add/{bookId}")
    public ResponseEntity<?> addToWishlist(
            @PathVariable Long bookId,
            @RequestParam(required = false) String notes) throws Exception {

        WishlistDTO wishlistDTO = wishlistService.addToWishlist(bookId, notes);
        return ResponseEntity.ok(wishlistDTO);
    }

    @DeleteMapping("/remove/{bookId}")
    public ResponseEntity<ApiResponse> removeFromWishlist(@PathVariable Long bookId) throws Exception {
        wishlistService.removeFromWishlist(bookId);
        return ResponseEntity.ok(new ApiResponse("Book removed from wishlist successfully", true));
    }

    @GetMapping("/my-wishlist")
    public ResponseEntity<?> getMyWishlist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws Exception {

        pageResponse<WishlistDTO> wishlist = wishlistService.getMyWishlist(page, size);
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getWishlistsForAdmin(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws Exception {

        pageResponse<WishlistDTO> wishlist = wishlistService.getWishlists(userId, page, size);
        return ResponseEntity.ok(wishlist);
    }
}
