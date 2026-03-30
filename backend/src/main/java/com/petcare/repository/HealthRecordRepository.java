package com.petcare.repository;

import com.petcare.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByPetIdOrderByDateDesc(Long petId);

    List<HealthRecord> findByNextDueDate(java.time.LocalDate nextDueDate);
}
