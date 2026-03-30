package com.petcare.controller;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.dto.ForgotPasswordRequest;
import com.petcare.dto.ResetPasswordRequest;
import com.petcare.service.EmailService;
import java.time.LocalDateTime;

import com.petcare.dto.JwtResponse;
import com.petcare.dto.LoginRequest;
import com.petcare.dto.MessageResponse;
import com.petcare.dto.SignupRequest;
import com.petcare.entity.User;
import com.petcare.repository.UserRepository;
import com.petcare.repository.DoctorRepository;
import com.petcare.security.JwtUtils;
import com.petcare.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @Autowired
  DoctorRepository doctorRepository;

  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

    logger.info("Attempting to authenticate user with email: {}", loginRequest.getEmail());

    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

      // Check doctor approval status if the role is DOCTOR
      if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
        com.petcare.entity.Doctor doctor = doctorRepository.findByUserEmail(userDetails.getEmail())
            .orElseThrow(() -> new RuntimeException("Doctor profile missing"));
        
        if (doctor.getStatus() == com.petcare.entity.Doctor.Status.PENDING) {
          return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
              .body(new MessageResponse("Your medical credentials are currently under administrative review. Access is restricted."));
        } else if (doctor.getStatus() == com.petcare.entity.Doctor.Status.REJECTED) {
          return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
              .body(new MessageResponse("Your application to join the medical network has been declined."));
        }
      }

      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      logger.info("User authenticated successfully: {}", userDetails.getEmail());

      return ResponseEntity.ok(new JwtResponse(jwt,
          userDetails.getId(),
          userDetails.getEmail(),
          userDetails.getName(),
          roles.get(0)));
    } catch (Exception e) {
      logger.error("Authentication failed for user: {}. Error: {}", loginRequest.getEmail(), e.getMessage());
      return ResponseEntity.badRequest().body(new MessageResponse("Invalid email or password"));
    }
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Email is already in use!"));
    }

    // Create new user's account
    User user = new User();
    user.setName(signUpRequest.getName());
    user.setEmail(signUpRequest.getEmail());
    user.setPassword(encoder.encode(signUpRequest.getPassword()));

    try {
      User.Role role = User.Role.valueOf(signUpRequest.getRole().toUpperCase());
      user.setRole(role);
    } catch (IllegalArgumentException | NullPointerException e) {
      // Default to USER if invalid or null
      user.setRole(User.Role.USER);
    }

    userRepository.save(user);

    // If role is DOCTOR, also create a record in the doctors table
    if (user.getRole() == User.Role.DOCTOR) {
      com.petcare.entity.Doctor doctor = new com.petcare.entity.Doctor();
      doctor.setUser(user);
      doctor.setSpecialization(signUpRequest.getSpecialization() != null ? signUpRequest.getSpecialization() : "General Veterinarian");
      doctor.setAvailability("Mon - Fri, 9:00 AM - 5:00 PM");
      doctor.setConsultationFee(signUpRequest.getConsultationFee() != null ? signUpRequest.getConsultationFee() : 500.0);
      doctor.setExperienceYears(signUpRequest.getExperienceYears() != null ? signUpRequest.getExperienceYears() : 0);
      doctor.setClinicAddress(signUpRequest.getClinicAddress() != null ? signUpRequest.getClinicAddress() : "To be updated");
      doctorRepository.save(doctor);
    }

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }

  @Autowired
  EmailService emailService;

  @PostMapping("/forgot-password")
  public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

    // Generate 6-digit numeric OTP
    String otp = String.format("%06d", new java.util.Random().nextInt(999999));
    
    user.setResetPasswordToken(otp);
    user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(10)); // 10 min expiry
    userRepository.save(user);

    emailService.sendEmail(user.getEmail(), "Password Reset OTP",
        "Your Smart Pet Care verification code is: " + otp + "\n\n" +
        "This code will expire in 10 minutes.");

    return ResponseEntity.ok(new MessageResponse("Reset OTP sent to your email."));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    User user = userRepository.findByResetPasswordToken(request.getToken())
        .orElseThrow(() -> new RuntimeException("Invalid token"));

    if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Token expired"));
    }

    user.setPassword(encoder.encode(request.getNewPassword()));
    user.setResetPasswordToken(null);
    user.setResetPasswordTokenExpiry(null);
    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("Password reset successfully."));
  }

  @PostMapping("/google-login")
  public ResponseEntity<?> googleLogin(@RequestBody SignupRequest request) {
    // Logic for Google Login: Check if email exists. If yes, login. If no, register
    // then login.
    // Assuming frontend sends email, name, password (dummy or from google id)

    if (userRepository.existsByEmail(request.getEmail())) {
      // Login
      // Skip authenticating with a dummy password since we trust the provider and directly issue JWT.
      // If user registered via form, they have a password.
      // If via Google, they might not have a password or we use a set strategy.
      // STRATEGY: If Social Login, we trust the email. We can generate a token
      // directly without password check if we trust the provider.
      // But `authenticationManager` relies on password.
      // We should use `UserDetailsService` to load user and generate token manually.

      User user = userRepository.findByEmail(request.getEmail()).get();
      UserDetailsImpl userDetails = UserDetailsImpl.build(user);
      UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null,
          userDetails.getAuthorities());
      SecurityContextHolder.getContext().setAuthentication(auth);
      String jwt = jwtUtils.generateJwtToken(auth);

      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      return ResponseEntity.ok(new JwtResponse(jwt,
          userDetails.getId(),
          userDetails.getEmail(),
          userDetails.getName(),
          roles.get(0)));
    } else {
      // Register
      User user = new User();
      user.setName(request.getName());
      user.setEmail(request.getEmail());
      // Set a dummy password or random one for internal use
      String randomPassword = "GOOGLE_DEFAULT_PASSWORD_" + request.getEmail();
      user.setPassword(encoder.encode(randomPassword));
      user.setRole(User.Role.USER);
      userRepository.save(user);

      // Login immediately
      UserDetailsImpl userDetails = UserDetailsImpl.build(user);
      UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null,
          userDetails.getAuthorities());
      SecurityContextHolder.getContext().setAuthentication(auth);
      String jwt = jwtUtils.generateJwtToken(auth);

      return ResponseEntity.ok(new JwtResponse(jwt,
          user.getId(),
          user.getEmail(),
          user.getName(),
          "ROLE_USER"));
    }
  }
}
