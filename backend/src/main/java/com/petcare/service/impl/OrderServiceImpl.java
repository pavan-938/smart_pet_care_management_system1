package com.petcare.service.impl;

import com.petcare.dto.MarketplaceOrderDto;
import com.petcare.dto.OrderItemDto;
import com.petcare.entity.*;
import com.petcare.repository.*;
import com.petcare.service.OrderService;
import com.petcare.exception.ResourceNotFoundException;
import com.petcare.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

        private final OrderRepository orderRepository;
        private final CartItemRepository cartItemRepository;
        private final UserRepository userRepository;
        private final ProductRepository productRepository;

        @Override
        @Transactional
        public MarketplaceOrderDto placeOrder(Long userId, String shippingAddress, String paymentMethod) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User session invalid. Account not found."));

                List<CartItem> cartItems = cartItemRepository.findByUser(user);
                if (cartItems.isEmpty()) {
                        throw new AppException("Checkout Failed: Your shopping cart is empty.", HttpStatus.BAD_REQUEST);
                }

                BigDecimal totalAmount = cartItems.stream()
                                .map(item -> item.getProduct().getPrice()
                                                .multiply(BigDecimal.valueOf(item.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                Order order = Order.builder()
                                .user(user)
                                .orderDate(LocalDateTime.now())
                                .totalAmount(totalAmount)
                                .status("PENDING")
                                .shippingAddress(shippingAddress)
                                .paymentMethod(paymentMethod)
                                .build();

                Order savedOrder = orderRepository.save(order);

                List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
                        Product product = cartItem.getProduct();

                        // Stock Integrity Check
                        if (product.getStockQuantity() < cartItem.getQuantity()) {
                                throw new AppException(
                                                "Inventory Conflict: '" + product.getName() + "' is out of stock.",
                                                HttpStatus.CONFLICT);
                        }

                        // Deduct Stock
                        product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
                        productRepository.save(product);

                        return OrderItem.builder()
                                        .order(savedOrder)
                                        .product(cartItem.getProduct())
                                        .quantity(cartItem.getQuantity())
                                        .price(cartItem.getProduct().getPrice())
                                        .build();
                }).collect(Collectors.toList());

                savedOrder.setItems(orderItems);
                orderRepository.save(savedOrder);

                // Clear Persistent Cart
                cartItemRepository.deleteByUser(user);

                return convertToDto(savedOrder);
        }

        @Override
        public List<MarketplaceOrderDto> getUserOrders(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return orderRepository.findByUser(user).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        @Override
        public MarketplaceOrderDto getOrderById(Long orderId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Reference ID missing: Order #" + orderId + " not found."));
                return convertToDto(order);
        }

        @Override
        public List<MarketplaceOrderDto> getAllOrders() {
                return orderRepository.findAll().stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public MarketplaceOrderDto updateOrderStatus(Long orderId, String status) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order reference lost."));
                order.setStatus(status);
                return convertToDto(orderRepository.save(order));
        }

        private MarketplaceOrderDto convertToDto(Order order) {
                List<OrderItemDto> itemDtos = order.getItems().stream()
                                .map(item -> OrderItemDto.builder()
                                                .id(item.getId())
                                                .productId(item.getProduct().getId())
                                                .productName(item.getProduct().getName())
                                                .quantity(item.getQuantity())
                                                .price(item.getPrice())
                                                .build())
                                .collect(Collectors.toList());

                return MarketplaceOrderDto.builder()
                                .id(order.getId())
                                .orderDate(order.getOrderDate())
                                .totalAmount(order.getTotalAmount())
                                .status(order.getStatus())
                                .shippingAddress(order.getShippingAddress())
                                .paymentMethod(order.getPaymentMethod())
                                .items(itemDtos)
                                .build();
        }
}
