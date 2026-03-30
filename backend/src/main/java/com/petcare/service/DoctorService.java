package com.petcare.service;

import com.petcare.dto.DoctorDto;
import com.petcare.entity.Doctor;
import java.util.List;

public interface DoctorService {
    List<DoctorDto> getAllDoctors();
    List<DoctorDto> getAllDoctorsUnfiltered();

    DoctorDto getDoctorById(Long id);

    Doctor saveDoctor(Doctor doctor);

    void deleteDoctor(Long id);

    List<DoctorDto> getDoctorsByStatus(Doctor.Status status);

    DoctorDto getDoctorByEmail(String email);

    long getCount();
}
