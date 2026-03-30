package com.petcare.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminDashboardDto {

    // ── Core KPIs ──────────────────────────────────────────────────
    private long totalUsers;
    private long totalDoctors;
    private long totalPets;
    private long totalAppointments;
    private long totalOrders;
    private BigDecimal totalRevenue;

    private List<com.petcare.entity.User> recentMembers;

    // ── Appointment Breakdown ──────────────────────────────────────
    private Map<String, Long> appointmentsByStatus; // PENDING/CONFIRMED/COMPLETED/CANCELLED → count
    private Map<String, Long> appointmentsByMonth; // "Jan","Feb",… → count (last 6 months)

    // ── Revenue Trend ──────────────────────────────────────────────
    private Map<String, BigDecimal> revenueByMonth; // "Jan","Feb",… → revenue (last 6 months)

    // ── Pet Insights ──────────────────────────────────────────────
    private Map<String, Long> petsBySpecies; // "Dog","Cat",… → count

    // ── Top Doctors (by appointment count) ────────────────────────
    private List<TopDoctorDto> topDoctors;

    // ── Nested DTO ────────────────────────────────────────────────
    @Data
    @Builder
    public static class TopDoctorDto {
        private Long doctorId;
        private String name;
        private String specialization;
        private long appointmentCount;
    }
}
