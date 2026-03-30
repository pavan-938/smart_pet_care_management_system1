package com.petcare.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private Long appointmentId;
    private Long orderId;
    private Double amount;
}
