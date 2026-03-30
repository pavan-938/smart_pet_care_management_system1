package com.petcare.controller;

import com.petcare.dto.HealthRecordDto;
import com.petcare.service.HealthRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/health-records")
public class HealthRecordController {

    @Autowired
    private HealthRecordService healthRecordService;

    @GetMapping("/pet/{petId}")
    @PreAuthorize("hasRole('USER') or hasRole('DOCTOR')")
    public List<HealthRecordDto> getHealthRecordsByPet(@PathVariable Long petId) {
        return healthRecordService.getHealthRecordsByPet(petId);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('USER') or hasRole('DOCTOR')")
    public ResponseEntity<?> addHealthRecord(@RequestBody HealthRecordDto healthRecordDto) {
        HealthRecordDto saved = healthRecordService.addHealthRecord(healthRecordDto);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteHealthRecord(@PathVariable Long id) {
        healthRecordService.deleteHealthRecord(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pet/{petId}/report")
    @PreAuthorize("hasRole('USER') or hasRole('DOCTOR')")
    public ResponseEntity<byte[]> getHealthReport(@PathVariable Long petId) {
        byte[] pdf = healthRecordService.generateHealthReport(petId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "health_report_" + petId + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
