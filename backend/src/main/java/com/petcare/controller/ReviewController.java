package com.petcare.controller;

import com.petcare.entity.Doctor;
import com.petcare.entity.Review;
import com.petcare.entity.User;
import com.petcare.repository.DoctorRepository;
import com.petcare.repository.ReviewRepository;
import com.petcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Review>> getReviewsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(reviewRepository.findByDoctorId(doctorId));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Unauthorized");
        
        Long doctorId = Long.valueOf(payload.get("doctorId").toString());
        Integer rating = Integer.valueOf(payload.get("rating").toString());
        String comment = payload.get("comment") != null ? payload.get("comment").toString() : "";

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Review review = new Review();
        review.setUser(user);
        review.setDoctor(doctor);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/doctor/{doctorId}/stats")
    public ResponseEntity<?> getDoctorStats(@PathVariable Long doctorId) {
        List<Review> reviews = reviewRepository.findByDoctorId(doctorId);
        double averageRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", averageRating);
        stats.put("totalReviews", reviews.size());
        return ResponseEntity.ok(stats);
    }
}
