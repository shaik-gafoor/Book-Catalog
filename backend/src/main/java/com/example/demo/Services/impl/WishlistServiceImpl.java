package com.example.demo.Services.impl;

import com.example.demo.Services.UserService;
import com.example.demo.Services.WishlistService;
import com.example.demo.Services.SubscriptionService;
import com.example.demo.mapper.WishlistMapper;
import com.example.demo.model.Book;
import com.example.demo.model.User;
import com.example.demo.model.Wishlist;
import com.example.demo.payload.dto.SubscriptionDTO;
import com.example.demo.payload.dto.WishlistDTO;
import com.example.demo.payload.response.pageResponse;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.WishlistRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final UserService userService;
    private final BookRepository bookRepository;
    private final WishlistRepository wishlistRepository;
    private final WishlistMapper wishlistMapper;
    private final SubscriptionService subscriptionService;


    @Override
    public WishlistDTO addToWishlist(Long bookId, String notes) throws Exception {
        User user = userService.getCurrentUser();
        SubscriptionDTO subscription = subscriptionService.getUsersActiveSubscription(user.getId());
        String planCode = subscription != null && subscription.getPlanCode() != null ? subscription.getPlanCode() : "FREE";

        if ("FREE".equalsIgnoreCase(planCode)) {
            throw new Exception("Wishlist is not available on the Free plan. Upgrade to Basic or Premium to save books.");
        }

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
        return wishlistMapper.toDTO(saved);
    }

    @Override
    public void removeFromWishlist(Long bookId) throws Exception {
        User user = userService.getCurrentUser();

        Wishlist wishlist = wishlistRepository.findByUserIdAndBookId(user.getId(), bookId);

        if(wishlist == null) {
            throw new Exception("book is not in your wishlist");
        }

        wishlistRepository.delete(wishlist);
    }

    @Override
    public pageResponse<WishlistDTO> getMyWishlist(int page, int size) throws Exception {
        Long userId = userService.getCurrentUser().getId();
        Pageable pageable = PageRequest.of(page,
                size, Sort.by("addedAt").descending());
        Page<Wishlist> wishlistPage = wishlistRepository.findByUserId(userId, pageable);
        return convertToPageResponse(wishlistPage);
    }

    private pageResponse<WishlistDTO> convertToPageResponse(Page<Wishlist> wishlistPage) {
        List<WishlistDTO> wishlistDTOs = wishlistPage.getContent()
                .stream()
                .map(wishlistMapper::toDTO)
                .collect(Collectors.toList());

        return new pageResponse<>(
                wishlistDTOs,
                wishlistPage.getNumber(),
                wishlistPage.getSize(),
                wishlistPage.getTotalElements(),
                wishlistPage.getTotalPages(),
                wishlistPage.isLast(),
                wishlistPage.isFirst(),
                wishlistPage.isEmpty()
        );
    }
}
