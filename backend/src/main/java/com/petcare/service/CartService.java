package com.petcare.service;

import com.petcare.dto.CartItemDto;
import java.util.List;

public interface CartService {
    List<CartItemDto> getCartItems(Long userId);

    CartItemDto addToCart(Long userId, Long productId, Integer quantity);

    CartItemDto updateQuantity(Long userId, Long cartItemId, Integer quantity);

    void removeFromCart(Long userId, Long cartItemId);

    void clearCart(Long userId);
}
