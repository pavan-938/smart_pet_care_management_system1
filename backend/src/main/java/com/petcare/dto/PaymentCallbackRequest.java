package com.petcare.dto;

import lombok.Data;

@Data
public class PaymentCallbackRequest {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private Long appointmentId; // Optional, can be derived from orderId if stored
}
