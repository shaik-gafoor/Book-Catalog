package com.example.demo.payload.response;

import lombok.*;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PaymentLinkResponse {
    private String payment_link_url;
    private String payment_link_id;
}
