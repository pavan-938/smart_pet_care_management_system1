package com.petcare.controller;

import com.petcare.dto.AdminDashboardDto;
import com.petcare.dto.DoctorDto;
import com.petcare.dto.AdminUserDto;
import com.petcare.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardDto> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/doctors/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorDto>> getPendingDoctors() {
        return ResponseEntity.ok(adminService.getPendingDoctors());
    }

    @PutMapping("/doctors/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateDoctorStatus(@PathVariable Long id, @RequestParam String status) {
        adminService.updateDoctorStatus(id, status);
        return ResponseEntity.ok("Doctor status updated successfully");
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        return ResponseEntity.ok(adminService.getAllDoctors());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}/inactive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteInactiveUser(@PathVariable Long id) {
        adminService.deleteInactiveUser(id);
        return ResponseEntity.ok("Inactive user deleted successfully");
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.petcare.entity.Order>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }
}
