package com.petcare.repository;

import com.petcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);

    Boolean existsByEmail(String email);
    
    java.util.List<com.petcare.entity.User> findTop5ByOrderByRegistrationDateDesc();
}
