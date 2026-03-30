package com.petcare.service.impl;

import com.petcare.dto.OrderRequest;
import com.petcare.dto.PaymentCallbackRequest;
import com.petcare.dto.PaymentDto;
import com.petcare.entity.Appointment;
import com.petcare.entity.Payment;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.PaymentRepository;
import com.petcare.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private com.petcare.repository.OrderRepository orderRepository;

    @PostConstruct
    public void init() {
        try {
            if (!"YOUR_KEY_ID".equals(keyId)) {
                this.razorpayClient = new RazorpayClient(keyId, keySecret);
            }
        } catch (RazorpayException e) {
            System.err.println("Failed to initialize Razorpay Client: " + e.getMessage());
        }
    }

    @Override
    public PaymentDto createOrder(OrderRequest orderRequest) throws RazorpayException {
        Double amount = orderRequest.getAmount();
        String receipt = "";
        Appointment appointment = null;
        com.petcare.entity.Order order = null;

        if (orderRequest.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(orderRequest.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
            receipt = "appt_" + appointment.getId();
        } else if (orderRequest.getOrderId() != null) {
            order = orderRepository.findById(orderRequest.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            receipt = "order_" + order.getId();
        } else {
            throw new RuntimeException("Either appointmentId or orderId must be provided");
        }

        JSONObject orderRequestJson = new JSONObject();
        orderRequestJson.put("amount", (int) (amount * 100)); // Razorpay expects paise
        orderRequestJson.put("currency", "INR");
        orderRequestJson.put("receipt", receipt);

        String razorpayOrderId;
        if (razorpayClient != null) {
            Order rzpOrder = razorpayClient.orders.create(orderRequestJson);
            razorpayOrderId = rzpOrder.get("id");
        } else {
            razorpayOrderId = "order_mock_" + System.currentTimeMillis();
        }

        Payment payment = new Payment();
        payment.setAppointment(appointment);
        payment.setOrder(order);
        payment.setAmount(amount);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setStatus("CREATED");

        Payment saved = paymentRepository.save(payment);
        return convertToDto(saved);
    }

    @Override
    public PaymentDto verifyPayment(PaymentCallbackRequest callbackRequest) throws RazorpayException {
        // Need to add dependency for Razorpay Utils if not present
        // Or implement verification manually HmacSHA256
        // Razorpay java SDK includes Utils.

        String signature = callbackRequest.getRazorpaySignature();

        boolean isValid = false;
        if (razorpayClient != null) {
            try {
                isValid = Utils.verifyPaymentSignature(new JSONObject()
                        .put("razorpay_order_id", callbackRequest.getRazorpayOrderId())
                        .put("razorpay_payment_id", callbackRequest.getRazorpayPaymentId())
                        .put("razorpay_signature", signature), keySecret);
            } catch (Exception e) {
                // Fallback or rethrow
                throw new RazorpayException(e.getMessage());
            }
        } else {
            isValid = true;
        }

        if (isValid) {
            Payment payment = paymentRepository.findByRazorpayOrderId(callbackRequest.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            payment.setRazorpayPaymentId(callbackRequest.getRazorpayPaymentId());
            payment.setStatus("PAID");
            Payment saved = paymentRepository.save(payment);

            // Update associated entity status
            if (payment.getAppointment() != null) {
                Appointment appointment = payment.getAppointment();
                appointment.setStatus(Appointment.Status.CONFIRMED);
                appointmentRepository.save(appointment);
            } else if (payment.getOrder() != null) {
                com.petcare.entity.Order order = payment.getOrder();
                order.setStatus("PAID");
                orderRepository.save(order);
            }

            return convertToDto(saved);
        } else {
            throw new RuntimeException("Payment verification failed");
        }
    }

    @Override
    public PaymentDto getPaymentByAppointmentId(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElse(null);
        if (payment == null)
            return null;
        return convertToDto(payment);
    }

    private PaymentDto convertToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        if (payment.getAppointment() != null) {
            dto.setAppointmentId(payment.getAppointment().getId());
        }
        if (payment.getOrder() != null) {
            dto.setOrderId(payment.getOrder().getId());
        }
        dto.setAmount(payment.getAmount());
        dto.setRazorpayOrderId(payment.getRazorpayOrderId());
        dto.setRazorpayPaymentId(payment.getRazorpayPaymentId());
        dto.setStatus(payment.getStatus());
        return dto;
    }
}
