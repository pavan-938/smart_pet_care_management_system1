package com.petcare.service;

import com.petcare.dto.AdminDashboardDto;
import com.petcare.dto.DoctorDto;
import com.petcare.dto.AdminUserDto;
import java.util.List;

public interface AdminService {
    AdminDashboardDto getDashboardStats();
    List<DoctorDto> getPendingDoctors();
    List<DoctorDto> getAllDoctors();
    void updateDoctorStatus(Long doctorId, String status);
    List<AdminUserDto> getAllUsers();
    List<com.petcare.entity.Order> getAllOrders();
    void deleteInactiveUser(Long userId);
}
