package com.petcare.service;

import com.petcare.dto.HealthRecordDto;
import java.util.List;

public interface HealthRecordService {
    List<HealthRecordDto> getHealthRecordsByPet(Long petId);

    HealthRecordDto addHealthRecord(HealthRecordDto healthRecordDto);

    void deleteHealthRecord(Long id);

    byte[] generateHealthReport(Long petId);
}
