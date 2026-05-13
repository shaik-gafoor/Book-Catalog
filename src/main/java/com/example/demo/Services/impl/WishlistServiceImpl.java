package com.example.demo.Services.impl;

import com.example.demo.Services.UserService;
import com.example.demo.Services.WishlistService;
import com.example.demo.model.Book;
import com.example.demo.model.User;
import com.example.demo.model.Wishlist;
import com.example.demo.payload.dto.WishlistDTO;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.WishlistRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final UserService userService;
    private final BookRepository bookRepository;
    private final WishlistRepository wishlistRepository;


    @Override
    public WishlistDTO addToWishlist(Long bookId, String notes) throws Exception {
        User user = userService.getCurrentUser();

// 1. validate book exist
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new Exception("Book not found"));

// 2. check if book is already in wishlist
        if (wishlistRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            throw new Exception("book is already in your wishlist");
        }
        // create wishlist
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setBook(book);
        wishlist.setNotes(notes);
        Wishlist saved = wishlistRepository.save(wishlist);
        return null;
    }

    @Override
    public void removeFromWishlist(Long bookId) {

    }

    @Override
    public pageResponse<WishlistDTO> getMyWishlist(int page, int size) {
        return null;
    }
}
