package com.petcare.util;

import com.petcare.entity.Category;
import com.petcare.entity.Doctor;
import com.petcare.entity.Product;
import com.petcare.entity.User;
import com.petcare.repository.CategoryRepository;
import com.petcare.repository.DoctorRepository;
import com.petcare.repository.ProductRepository;
import com.petcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private DoctorRepository doctorRepository;

        @Autowired
        private CategoryRepository categoryRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                // Seed Doctors (Updated to always sync)
                seedDoctor("Sarah Jenkins", "sarah.jenkins@petcare.com", "Senior Surgeon",
                                "Mon - Fri, 9:00 AM - 5:00 PM",
                                800.0, 12,
                                "Consultant surgeon specialising in orthopedics and advanced trauma recovery for all pets.",
                                "/images/doctor_sarah.png", "Downtown Vet Clinic, 124 Main St");
                seedDoctor("Michael Chen", "michael.chen@petcare.com", "Dental Specialist",
                                "Tue - Sat, 10:00 AM - 6:00 PM",
                                650.0, 8,
                                "Expert in veterinary dentistry and oral maxillary surgery with a focus on pain-free procedures.",
                                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
                                "Westside Pet Hospital, 89 Central Ave");
                seedDoctor("Emily Rodriguez", "emily.r@petcare.com", "Dermatologist", "Mon - Thu, 8:00 AM - 4:00 PM",
                                700.0, 6,
                                "Focused on skin allergies and chronic inflammatory conditions in cats and dogs.",
                                "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600",
                                "North End Animal Care, 4500 Pine Blvd");
                seedDoctor("David Wilson", "david.w@petcare.com", "Cardiologist", "Wed - Sun, 9:00 AM - 5:00 PM",
                                900.0, 15,
                                "Specialist in heart conditions and circulatory health with a passion for senior pet care.",
                                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
                                "City Heart Vet Center, 77 Medical Plaza");
                seedDoctor("Lisa Thompson", "lisa.t@petcare.com", "Neurologist", "Mon - Fri, 10:00 AM - 4:00 PM",
                                850.0, 10, "Dedicated to neurological diagnosis and rehabilitation for small animals.",
                                "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600",
                                "Pet Medical Institute, 10 Research Way");

                // Seed default Pet Owner
                seedUser("Supreeth", "supreeth1@gmail.com", "password123", User.Role.USER);
                seedUser("Pavann", "pavann@gmail.com", "password123", User.Role.USER);
                seedUser("Pavan", "pavan@gmail.com", "password123", User.Role.USER);
                
                // Seed Doctors (Updated list)
                seedUser("Dr. Supreeth", "supreeth.doc@petcare.com", "password123", User.Role.DOCTOR);
                seedDoctor("Dr. Supreeth", "supreeth.doc@petcare.com", "Surgery Specialist", "Mon - Sat, 10 AM - 4 PM", 500.0, 5, "Dedicated surgeon for all pets", "/images/doctor_sarah.png", "Downtown Clinic");

                // Seed default ADMIN
                seedUser("Admin Supreeth", "supreeth.admin@petcare.com", "admin123", User.Role.ADMIN);
                seedUser("Admin User", "admin@petcare.com", "admin123", User.Role.ADMIN);

                // Seed Marketplace (Updated to always sync)
                seedMarketplace();

                System.out.println("Default users and marketplace data synced.");
        }

        private void seedUser(String name, String email, String password, User.Role role) {
                User user = userRepository.findByEmail(email).orElse(new User());
                user.setName(name);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole(role);
                userRepository.save(user);
        }

        private void seedDoctor(String name, String email, String specialization, String availability, Double fee,
                        Integer exp, String bio, String img, String clinicAddress) {
                User user = userRepository.findByEmail(email).orElse(null);
                if (user == null) {
                        user = new User();
                        user.setName(name);
                        user.setEmail(email);
                        user.setPassword(passwordEncoder.encode("password123"));
                        user.setRole(User.Role.DOCTOR);
                        user = userRepository.save(user);
                } else {
                        // Ensure password matches even for existing seeded doctors
                        user.setPassword(passwordEncoder.encode("password123"));
                        userRepository.save(user);
                }

                Doctor doctor = doctorRepository.findByUserEmail(email).orElse(new Doctor());
                doctor.setUser(user);
                doctor.setSpecialization(specialization);
                doctor.setAvailability(availability);
                doctor.setConsultationFee(fee);
                doctor.setExperienceYears(exp);
                doctor.setBio(bio);
                doctor.setImageUrl(img);
                doctor.setClinicAddress(clinicAddress);
                doctor.setStatus(Doctor.Status.APPROVED);
                doctorRepository.save(doctor);
        }

        private void seedMarketplace() {
                Category food = categoryRepository.findByName("Pet Food")
                                .orElseGet(() -> categoryRepository.save(Category.builder().name("Pet Food")
                                                .description("Premium quality food").build()));
                Category toys = categoryRepository.findByName("Toys")
                                .orElseGet(() -> categoryRepository
                                                .save(Category.builder().name("Toys").description("Fun toys").build()));
                Category accessories = categoryRepository.findByName("Accessories")
                                .orElseGet(() -> categoryRepository.save(Category.builder().name("Accessories")
                                                .description("Leashes and more").build()));
                Category health = categoryRepository.findByName("Health & Care")
                                .orElseGet(() -> categoryRepository.save(Category.builder().name("Health & Care")
                                                .description("Grooming").build()));

                saveOrUpdateProduct("Premium Dog Kibble", "High-protein 10kg pack for large breeds",
                                2500.0, 50,
                                "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600",
                                food);
                saveOrUpdateProduct("Cat Nip treats", "Organic catnip treats for feline fun",
                                450.0, 100,
                                "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&q=80&w=600",
                                food);
                saveOrUpdateProduct("Rubber Chew Toy", "Durable natural rubber toy for aggressive chewers",
                                550.0, 80,
                                "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600",
                                toys);

                saveOrUpdateProduct("Royal Canine Adult Dog", "Nutrition specifically for large breed adult dogs",
                                4500.0, 25,
                                "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600",
                                food);

                saveOrUpdateProduct("Whiskas Wet Cat Food", "Delicious ocean fish flavor for your feline friends",
                                850.0, 100,
                                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=600",
                                food);

                saveOrUpdateProduct("Interative Treat Puzzle", "Keep your pet mentally stimulated for hours", 1200.0,
                                15,
                                "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=600",
                                toys);

                saveOrUpdateProduct("Leather Padded Collar", "Handcrafted genuine leather for maximum comfort", 950.0,
                                40,
                                "https://images.unsplash.com/photo-1591160620577-07042097c88b?auto=format&fit=crop&q=80&w=600",
                                accessories);

                saveOrUpdateProduct("Gentle Grooming Brush", "Soft bristles suitable for all coat types", 450.0, 60,
                                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600",
                                health);
        }

        private void saveOrUpdateProduct(String name, String desc, Double price, Integer stock, String img,
                        Category cat) {
                Product product = productRepository.findByName(name).orElse(new Product());
                product.setName(name);
                product.setDescription(desc);
                product.setPrice(java.math.BigDecimal.valueOf(price));
                product.setStockQuantity(stock);
                product.setImageUrl(img);
                product.setCategory(cat);
                productRepository.save(product);
        }
}
