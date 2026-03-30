package com.petcare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MarketplaceOrderRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
