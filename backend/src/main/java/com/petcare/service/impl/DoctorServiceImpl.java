package com.petcare.service.impl;

import com.petcare.dto.DoctorDto;
import com.petcare.entity.Doctor;
import com.petcare.repository.DoctorRepository;
import com.petcare.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private com.petcare.repository.ReviewRepository reviewRepository;

    @Override
    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findByStatus(Doctor.Status.APPROVED).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorDto> getAllDoctorsUnfiltered() {
        return doctorRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorDto> getDoctorsByStatus(Doctor.Status status) {
        return doctorRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return convertToDto(doctor);
    }

    @Override
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @Override
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }

    @Override
    public DoctorDto getDoctorByEmail(String email) {
        Doctor doctor = doctorRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found for email: " + email));
        return convertToDto(doctor);
    }

    @Override
    public long getCount() {
        return doctorRepository.count();
    }

    private DoctorDto convertToDto(Doctor doctor) {
        DoctorDto dto = new DoctorDto();
        dto.setId(doctor.getId());
        dto.setUserId(doctor.getUser().getId());
        dto.setName(doctor.getUser().getName());
        dto.setEmail(doctor.getUser().getEmail());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setAvailability(doctor.getAvailability());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setExperienceYears(doctor.getExperienceYears());
        dto.setBio(doctor.getBio());
        dto.setImageUrl(doctor.getImageUrl());
        dto.setClinicAddress(doctor.getClinicAddress());
        dto.setQualification(doctor.getQualification());
        
        // Calculate dynamic rating
        List<com.petcare.entity.Review> reviews = reviewRepository.findByDoctorId(doctor.getId());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream().mapToInt(com.petcare.entity.Review::getRating).average().orElse(0.0);
            dto.setRating(avg);
        } else {
            dto.setRating(4.5); // Default for new doctors
        }
        
        dto.setStatus(doctor.getStatus().name());
        return dto;
    }
}
