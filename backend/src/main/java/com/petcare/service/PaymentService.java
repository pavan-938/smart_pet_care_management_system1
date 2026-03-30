package com.petcare.service;

import com.petcare.dto.OrderRequest;
import com.petcare.dto.PaymentCallbackRequest;
import com.petcare.dto.PaymentDto;
import com.razorpay.RazorpayException;

public interface PaymentService {
    PaymentDto createOrder(OrderRequest orderRequest) throws RazorpayException;

    PaymentDto verifyPayment(PaymentCallbackRequest callbackRequest) throws RazorpayException;

    PaymentDto getPaymentByAppointmentId(Long appointmentId);
}
