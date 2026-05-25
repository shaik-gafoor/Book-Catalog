package com.example.demo.payload.response;

import com.example.demo.payload.dto.SubscriptionDTO;
import com.example.demo.payload.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private UserDTO user;
    private SubscriptionDTO activeSubscription;
}