package com.petcare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class SymptomCheckerController {

    private final Map<String, List<String>> symptomToDiseases = new HashMap<>();
    private final Map<String, String> diseaseDescriptions = new HashMap<>();

    public SymptomCheckerController() {
        // Simple demo knowledge base
        symptomToDiseases.put("vomiting", Arrays.asList("Parvovirus", "Gastritis", "Food Poisoning"));
        symptomToDiseases.put("diarrhea", Arrays.asList("Parvovirus", "Parasites", "Dietary Indiscretion"));
        symptomToDiseases.put("itching", Arrays.asList("Flea Allergy", "Mange", "Atopic Dermatitis"));
        symptomToDiseases.put("lethargy", Arrays.asList("Distemper", "Heartworm", "Anemia"));
        symptomToDiseases.put("coughing", Arrays.asList("Kennel Cough", "Heart Failure", "Pneumonia"));
        symptomToDiseases.put("hair loss", Arrays.asList("Ringworm", "Hypothyroidism", "Cushing's Disease"));

        diseaseDescriptions.put("Parvovirus", "A highly contagious viral disease that causes severe vomiting and bloody diarrhea. REQUIRES IMMEDIATE VET CARE.");
        diseaseDescriptions.put("Gastritis", "Inflammation of the stomach lining. Can be caused by eating something bad.");
        diseaseDescriptions.put("Flea Allergy", "A common skin condition caused by hypersensitivity to flea saliva.");
        diseaseDescriptions.put("Kennel Cough", "A contagious respiratory disease often spread in dog parks or boarding facilities.");
        diseaseDescriptions.put("Distemper", "A serious viral disease affecting respiratory, gastrointestinal, and nervous systems.");
        diseaseDescriptions.put("Heartworm", "A serious and potentially fatal disease caused by foot-long worms that live in the heart, lungs and associated blood vessels.");
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody Map<String, List<String>> request) {
        List<String> symptoms = request.get("symptoms");
        if (symptoms == null || symptoms.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No symptoms provided"));
        }

        Map<String, Integer> diseaseScore = new HashMap<>();
        for (String symptom : symptoms) {
            String lowerSymptom = symptom.toLowerCase().trim();
            for (Map.Entry<String, List<String>> entry : symptomToDiseases.entrySet()) {
                if (lowerSymptom.contains(entry.getKey())) {
                    for (String disease : entry.getValue()) {
                        diseaseScore.put(disease, diseaseScore.getOrDefault(disease, 0) + 1);
                    }
                }
            }
        }

        List<Map<String, Object>> results = diseaseScore.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("disease", entry.getKey());
                    result.put("confidence", Math.min(95, entry.getValue() * 30 + 10)); // Mock confidence calc
                    result.put("description", diseaseDescriptions.getOrDefault(entry.getKey(), "Common clinical condition mapping this symptom. Consult a vet for diagnosis."));
                    return result;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("predictions", results);
        response.put("disclaimer", "This is an AI simulation for demonstration. Always consult a certified veterinarian.");
        
        return ResponseEntity.ok(response);
    }
}
