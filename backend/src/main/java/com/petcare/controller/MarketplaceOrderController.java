package com.petcare.controller;

import com.petcare.dto.MarketplaceOrderDto;
import com.petcare.security.UserDetailsImpl;
import com.petcare.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/marketplace/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarketplaceOrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<MarketplaceOrderDto> placeOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody com.petcare.dto.MarketplaceOrderRequest orderRequest) {
        return ResponseEntity.ok(orderService.placeOrder(
                userDetails.getId(),
                orderRequest.getShippingAddress(),
                orderRequest.getPaymentMethod()));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<MarketplaceOrderDto>> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getUserOrders(userDetails.getId()));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<MarketplaceOrderDto> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MarketplaceOrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarketplaceOrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}
