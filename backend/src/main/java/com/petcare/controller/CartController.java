package com.petcare.controller;

import com.petcare.dto.CartItemDto;
import com.petcare.security.UserDetailsImpl;
import com.petcare.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<CartItemDto>> getCartItems(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.getCartItems(userDetails.getId()));
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<CartItemDto> addToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(userDetails.getId(), productId, quantity));
    }

    @PutMapping("/{cartItemId}")
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<CartItemDto> updateQuantity(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(userDetails.getId(), cartItemId, quantity));
    }

    @DeleteMapping("/{cartItemId}")
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> removeFromCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long cartItemId) {
        cartService.removeFromCart(userDetails.getId(), cartItemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        cartService.clearCart(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
