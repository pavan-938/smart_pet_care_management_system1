package com.petcare.dto;

import lombok.Data;

@Data
public class PaymentDto {
    private Long id;
    private Long appointmentId;
    private Long orderId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Double amount;
    private String status;
}
