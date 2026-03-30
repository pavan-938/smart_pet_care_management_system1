package com.petcare.service;

import com.petcare.dto.MarketplaceOrderDto;
import java.util.List;

public interface OrderService {
    MarketplaceOrderDto placeOrder(Long userId, String shippingAddress, String paymentMethod);

    List<MarketplaceOrderDto> getUserOrders(Long userId);

    MarketplaceOrderDto getOrderById(Long orderId);

    List<MarketplaceOrderDto> getAllOrders();

    MarketplaceOrderDto updateOrderStatus(Long orderId, String status);
}
