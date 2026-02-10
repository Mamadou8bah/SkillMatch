package SkillMatch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroqService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public List<String> structureJobDataBatch(List<String> rawDataList) {
        if (rawDataList == null || rawDataList.isEmpty()) return new ArrayList<>();

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("${")) {
            log.warn("Groq API key is not configured. Skipping AI extraction.");
            return new ArrayList<>();
        }

        log.info("Structuring batch of {} jobs via Groq AI...", rawDataList.size());
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            StringBuilder userContent = new StringBuilder();
            userContent.append("Process and strictly structure these ").append(rawDataList.size()).append(" job descriptions into a JSON array.\n\n");
            
            for (int i = 0; i < rawDataList.size(); i++) {
                userContent.append("### JOB ").append(i).append(" ###\n")
                           .append(rawDataList.get(i))
                           .append("\n\n");
            }

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", 
                "You are an expert job data extraction assistant. Your mission is to standardize ALL job posts into a unified JSON format.\n\n" +
                "DATA QUALITY RULES:\n" +
                "1. TITLE: Specific and professional job title.\n" +
                "2. DESCRIPTION: High-level summary of the role. Strip out instructions/contact info. Start with role's purpose.\n" +
                "3. REQUIREMENTS: Extract ALL qualifications, years of experience, and education into this JSON array.\n" +
                "4. SKILLS: Extract technical tools, soft skills, and industry competencies into this JSON array.\n" +
                "5. INDUSTRY: General industry category.\n" +
                "6. SALARY: Specific range if mentioned, else 'Not Specified'.\n\n" +
                "FORMAT: Return ONLY a JSON array of objects with keys: " +
                "\"title\", \"description\", \"requirements\" (array), \"skills\" (array), \"industry\", \"salary\".\n" +
                "Do not include any conversational text or markdown other than the JSON block."));
            
            messages.add(Map.of("role", "user", "content", userContent.toString()));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile"); 
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.1);
            requestBody.put("max_tokens", 4000); 
            requestBody.put("response_format", Map.of("type", "json_object"));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.postForObject(GROQ_API_URL, entity, String.class);
            
            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").path(0).path("message").path("content").asText();
            
            JsonNode contentJson = objectMapper.readTree(content);
            List<String> results = new ArrayList<>();
            
            if (contentJson.isArray()) {
                for (JsonNode node : contentJson) {
                    if (node.isObject() && node.has("title") && !node.get("title").asText().isEmpty()) {
                        results.add(objectMapper.writeValueAsString(node));
                    }
                }
            } else if (contentJson.isObject() && contentJson.has("jobs")) {
                for (JsonNode node : contentJson.get("jobs")) {
                    if (node.isObject() && node.has("title") && !node.get("title").asText().isEmpty()) {
                        results.add(objectMapper.writeValueAsString(node));
                    }
                }
            }
            
            return results;
        } catch (Exception e) {
            log.error("Error calling Groq API for batch: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public String structureJobData(String rawData) {
        List<String> result = structureJobDataBatch(List.of(rawData));
        return result.isEmpty() ? null : result.get(0);
    }
}
