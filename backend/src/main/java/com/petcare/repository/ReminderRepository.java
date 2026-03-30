package com.petcare.repository;

import com.petcare.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByPetIdOrderByReminderDateAsc(Long petId);

    List<Reminder> findByPetIdAndCompletedFalseOrderByReminderDateAsc(Long petId);

    List<Reminder> findByPetOwnerEmailAndCompletedFalseOrderByReminderDateAsc(String email);
}
