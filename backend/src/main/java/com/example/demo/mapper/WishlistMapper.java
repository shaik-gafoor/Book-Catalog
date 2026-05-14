package com.example.demo.mapper;

import com.example.demo.model.Wishlist;
import com.example.demo.payload.dto.WishlistDTO;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor

public class WishlistMapper {

    private final BookMapper bookMapper;


    public WishlistDTO toDTO(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }

        WishlistDTO dto = new WishlistDTO();
        dto.setId(wishlist.getId());

        if (wishlist.getUser() != null) {
            dto.setUserId(wishlist.getUser().getId());
            dto.setUserFullName(wishlist.getUser().getFullName());
        }

        if (wishlist.getBook() != null) {
            dto.setBook(bookMapper.toDTO(wishlist.getBook()));
        }

        dto.setAddedAt(wishlist.getAddedAt());
        dto.setNotes(wishlist.getNotes());

        return dto;
    }
}
