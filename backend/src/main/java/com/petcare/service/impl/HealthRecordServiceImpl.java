package com.petcare.service.impl;

import com.petcare.dto.HealthRecordDto;
import com.petcare.entity.HealthRecord;
import com.petcare.entity.Pet;
import com.petcare.exception.ResourceNotFoundException;
import com.petcare.exception.AppException;
import com.petcare.repository.HealthRecordRepository;
import com.petcare.repository.PetRepository;
import com.petcare.service.HealthRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

@Service
@RequiredArgsConstructor
@Transactional
public class HealthRecordServiceImpl implements HealthRecordService {

        private final HealthRecordRepository healthRecordRepository;
        private final PetRepository petRepository;

        @Override
        public List<HealthRecordDto> getHealthRecordsByPet(Long petId) {
                if (!petRepository.existsById(petId)) {
                        throw new ResourceNotFoundException("Clinical error: Pet ID " + petId + " does not exist.");
                }
                return healthRecordRepository.findByPetIdOrderByDateDesc(petId).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        @Override
        public HealthRecordDto addHealthRecord(HealthRecordDto dto) {
                Pet pet = petRepository.findById(dto.getPetId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Record creation failed: Target pet not found."));

                HealthRecord record = new HealthRecord();
                record.setPet(pet);
                record.setRecordType(dto.getRecordType());
                record.setDescription(dto.getDescription());
                record.setDate(dto.getDate());
                record.setProvider(dto.getProvider());
                record.setWeight(dto.getWeight());
                record.setActivityLevel(dto.getActivityLevel());
                record.setCalories(dto.getCalories());
                record.setVaccineName(dto.getVaccineName());
                record.setNextDueDate(dto.getNextDueDate());
                record.setPrecautions(dto.getPrecautions());
                record.setDiagnosis(dto.getDiagnosis());
                record.setTreatment(dto.getTreatment());

                HealthRecord saved = healthRecordRepository.save(record);
                return convertToDto(saved);
        }

        @Override
        public void deleteHealthRecord(Long id) {
                if (!healthRecordRepository.existsById(id)) {
                        throw new ResourceNotFoundException("Cannot remove record: History entry not found.");
                }
                healthRecordRepository.deleteById(id);
        }

        @Override
        public byte[] generateHealthReport(Long petId) {
                Pet pet = petRepository.findById(petId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Report generation failed: Subject pet profile not found."));

                List<HealthRecord> records = healthRecordRepository.findByPetIdOrderByDateDesc(petId);

                try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                        PdfWriter writer = new PdfWriter(baos);
                        PdfDocument pdf = new PdfDocument(writer);
                        Document document = new Document(pdf);

                        // Title
                        Paragraph title = new Paragraph("Smart Pet Care - Comprehensive Clinical Report")
                                        .setBold().setFontSize(22).setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(20);
                        document.add(title);

                        // Pet Info
                        document.add(new Paragraph("Patient Profile Card").setBold().setFontSize(14).setUnderline());
                        document.add(new Paragraph("Pet Name: " + pet.getName()).setBold());
                        document.add(new Paragraph("Species & Breed: " + pet.getSpecies() + " | "
                                        + (pet.getBreed() != null ? pet.getBreed() : "N/A")));
                        document.add(new Paragraph(
                                        "Owner of Record: " + (pet.getOwner() != null ? pet.getOwner().getName()
                                                        : "Unknown")));
                        document.add(new Paragraph("Generated on: "
                                        + java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                                                        .format(java.time.ZonedDateTime.now())));
                        document.add(new Paragraph("\n"));

                        // Table
                        Table table = new Table(UnitValue.createPercentArray(new float[] { 12, 15, 10, 33, 30 }))
                                        .useAllAvailableWidth();

                        table.addHeaderCell(new Cell().add(new Paragraph("Date").setBold())
                                        .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY));
                        table.addHeaderCell(new Cell().add(new Paragraph("Type").setBold())
                                        .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY));
                        table.addHeaderCell(new Cell().add(new Paragraph("Vitals").setBold())
                                        .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY));
                        table.addHeaderCell(new Cell().add(new Paragraph("Clinical Observations").setBold())
                                        .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY));
                        table.addHeaderCell(new Cell().add(new Paragraph("Precautions").setBold())
                                        .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY));

                        for (HealthRecord record : records) {
                                table.addCell(record.getDate() != null ? record.getDate().toString() : "N/A");
                                table.addCell(record.getRecordType() != null ? record.getRecordType() : "General");
                                table.addCell(record.getWeight() != null ? record.getWeight() + " kg" : "-");
                                table.addCell(record.getDescription() != null ? record.getDescription()
                                                : "No notes recorded.");
                                table.addCell(record.getPrecautions() != null ? record.getPrecautions()
                                                : "Follow standard care.");
                        }

                        document.add(table);

                        document.add(new Paragraph("\n"));
                        document.add(new Paragraph("End of Clinical Summary.").setItalic().setFontSize(10)
                                        .setTextAlignment(TextAlignment.RIGHT));

                        document.close();
                        return baos.toByteArray();
                } catch (Exception e) {
                        throw new AppException("PDF compilation error: " + e.getMessage(),
                                        HttpStatus.INTERNAL_SERVER_ERROR);
                }
        }

        private HealthRecordDto convertToDto(HealthRecord record) {
                HealthRecordDto dto = new HealthRecordDto();
                dto.setId(record.getId());
                dto.setPetId(record.getPet().getId());
                dto.setRecordType(record.getRecordType());
                dto.setDescription(record.getDescription());
                dto.setDate(record.getDate());
                dto.setProvider(record.getProvider());
                dto.setWeight(record.getWeight());
                dto.setActivityLevel(record.getActivityLevel());
                dto.setCalories(record.getCalories());
                dto.setVaccineName(record.getVaccineName());
                dto.setNextDueDate(record.getNextDueDate());
                dto.setPrecautions(record.getPrecautions());
                dto.setDiagnosis(record.getDiagnosis());
                dto.setTreatment(record.getTreatment());
                return dto;
        }
}
