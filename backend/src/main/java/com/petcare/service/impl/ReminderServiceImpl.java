package com.petcare.service.impl;

import com.petcare.dto.ReminderDto;
import com.petcare.entity.Pet;
import com.petcare.entity.Reminder;
import com.petcare.repository.PetRepository;
import com.petcare.repository.ReminderRepository;
import com.petcare.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderServiceImpl implements ReminderService {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private PetRepository petRepository;

    @Override
    public List<ReminderDto> getRemindersByPet(Long petId) {
        return reminderRepository.findByPetIdOrderByReminderDateAsc(petId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReminderDto> getPendingRemindersByPet(Long petId) {
        return reminderRepository.findByPetIdAndCompletedFalseOrderByReminderDateAsc(petId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReminderDto> getMyPendingReminders(String email) {
        return reminderRepository.findByPetOwnerEmailAndCompletedFalseOrderByReminderDateAsc(email).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReminderDto addReminder(ReminderDto dto) {
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Reminder reminder = new Reminder();
        reminder.setPet(pet);
        reminder.setTitle(dto.getTitle());
        reminder.setDescription(dto.getDescription());
        reminder.setReminderDate(dto.getReminderDate());
        reminder.setCompleted(false);

        Reminder saved = reminderRepository.save(reminder);
        return convertToDto(saved);
    }

    @Override
    public ReminderDto markAsCompleted(Long id) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setCompleted(true);
        return convertToDto(reminderRepository.save(reminder));
    }

    @Override
    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    private ReminderDto convertToDto(Reminder reminder) {
        ReminderDto dto = new ReminderDto();
        dto.setId(reminder.getId());
        dto.setPetId(reminder.getPet().getId());
        dto.setTitle(reminder.getTitle());
        dto.setDescription(reminder.getDescription());
        dto.setReminderDate(reminder.getReminderDate());
        dto.setCompleted(reminder.isCompleted());
        return dto;
    }
}
