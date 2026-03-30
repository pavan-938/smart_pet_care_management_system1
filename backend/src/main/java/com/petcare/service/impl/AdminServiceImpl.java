package com.petcare.service.impl;

import com.petcare.dto.AdminDashboardDto;
import com.petcare.dto.DoctorDto;
import com.petcare.dto.AdminUserDto;
import com.petcare.entity.Doctor;
import com.petcare.entity.Order;
import com.petcare.entity.User;
import com.petcare.repository.*;
import com.petcare.service.AdminService;
import com.petcare.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final OrderRepository orderRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorService doctorService;

    @Override
    public AdminDashboardDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalPets = petRepository.count();
        long totalAppointments = appointmentRepository.count();

        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> apptStats = appointmentRepository.findAll().stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        return AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .totalDoctors(doctorRepository.count())
                .totalPets(totalPets)
                .totalAppointments(totalAppointments)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .appointmentsByStatus(apptStats)
                .recentMembers(userRepository.findTop5ByOrderByRegistrationDateDesc())
                .build();
    }

    @Override
    public List<DoctorDto> getPendingDoctors() {
        return doctorService.getDoctorsByStatus(Doctor.Status.PENDING);
    }

    @Override
    public List<DoctorDto> getAllDoctors() {
        return doctorService.getAllDoctorsUnfiltered();
    }

    @Override
    public void updateDoctorStatus(Long doctorId, String status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setStatus(Doctor.Status.valueOf(status.toUpperCase()));
        doctorRepository.save(doctor);
    }

    @Override
    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toAdminUserDto)
                .sorted(Comparator.comparing(AdminUserDto::getRegistrationDate,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<com.petcare.entity.Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public void deleteInactiveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.USER) {
            throw new RuntimeException("Only regular user accounts can be deleted.");
        }

        if (!isInactive(user)) {
            throw new RuntimeException("User is active and cannot be deleted.");
        }

        userRepository.delete(user);
    }

    private AdminUserDto toAdminUserDto(User user) {
        long petsCount = petRepository.findByOwnerId(user.getId()).size();
        long appointmentsCount = appointmentRepository.findByPetOwnerId(user.getId()).size();
        long ordersCount = orderRepository.findByUserId(user.getId()).size();

        return AdminUserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .registrationDate(user.getRegistrationDate())
                .inactive(isInactive(user, petsCount, appointmentsCount, ordersCount))
                .petsCount(petsCount)
                .appointmentsCount(appointmentsCount)
                .ordersCount(ordersCount)
                .build();
    }

    private boolean isInactive(User user) {
        long petsCount = petRepository.findByOwnerId(user.getId()).size();
        long appointmentsCount = appointmentRepository.findByPetOwnerId(user.getId()).size();
        long ordersCount = orderRepository.findByUserId(user.getId()).size();
        return isInactive(user, petsCount, appointmentsCount, ordersCount);
    }

    private boolean isInactive(User user, long petsCount, long appointmentsCount, long ordersCount) {
        if (user.getRole() != User.Role.USER) {
            return false;
        }
        boolean noActivity = petsCount == 0 && appointmentsCount == 0 && ordersCount == 0;
        LocalDateTime registrationDate = user.getRegistrationDate();
        boolean olderThan30Days = registrationDate != null && registrationDate.isBefore(LocalDateTime.now().minusDays(30));
        return noActivity && olderThan30Days;
    }
}
