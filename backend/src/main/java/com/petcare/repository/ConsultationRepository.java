package com.petcare.repository;

import com.petcare.entity.Consultation;
import com.petcare.entity.Doctor;
import com.petcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByUser(User user);
    List<Consultation> findByDoctor(Doctor doctor);
}
