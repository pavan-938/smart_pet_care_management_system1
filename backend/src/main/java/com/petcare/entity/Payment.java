package com.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = true)
    @JoinColumn(name = "appointment_id", nullable = true)
    private Appointment appointment;

    @OneToOne(optional = true)
    @JoinColumn(name = "order_id", nullable = true)
    private Order order;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Double amount;

    private String status; // Created, Paid, Failed
}
