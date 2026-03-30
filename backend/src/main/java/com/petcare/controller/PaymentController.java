package com.petcare.controller;

import com.petcare.dto.OrderRequest;
import com.petcare.dto.PaymentCallbackRequest;
import com.petcare.dto.PaymentDto;
import com.petcare.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Value("${razorpay.key.id}")
    private String razorpayKey;

    @GetMapping("/key")
    public ResponseEntity<?> getRazorpayKey() {
        return ResponseEntity.ok(java.util.Collections.singletonMap("key", razorpayKey));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            PaymentDto created = paymentService.createOrder(orderRequest);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentCallbackRequest callbackRequest) {
        try {
            PaymentDto verified = paymentService.verifyPayment(callbackRequest);
            return ResponseEntity.ok(verified);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment verification failed: " + e.getMessage());
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointment(@PathVariable Long appointmentId) {
        PaymentDto payment = paymentService.getPaymentByAppointmentId(appointmentId);
        if (payment != null) {
            return ResponseEntity.ok(payment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
