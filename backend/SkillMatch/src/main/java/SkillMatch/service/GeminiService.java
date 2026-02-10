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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=";

    public List<String> structureJobDataBatch(List<String> rawDataList) {
        if (rawDataList == null || rawDataList.isEmpty()) return new ArrayList<>();

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("${")) {
            log.warn("Gemini API key is not configured. Skipping AI extraction.");
            return new ArrayList<>();
        }

        log.info("Structuring batch of {} jobs via Gemini AI...", rawDataList.size());
        
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                StringBuilder prompt = new StringBuilder();
                prompt.append("You are an expert job data extraction assistant. Your mission is to standardize job posts into a unified JSON format.\n\n");
                prompt.append("DATA QUALITY RULES:\n");
                prompt.append("1. TITLE: Specific and professional job title.\n");
                prompt.append("2. DESCRIPTION: High-level summary of the role. Strip out instructions/contact info. Start with role's purpose.\n");
                prompt.append("3. REQUIREMENTS: Extract ALL qualifications, years of experience, and education into this JSON array.\n");
                prompt.append("4. SKILLS: Extract technical tools, soft skills, and industry competencies into this JSON array.\n");
                prompt.append("5. INDUSTRY: General industry category.\n");
                prompt.append("6. SALARY: Specific range if mentioned, else 'Not Specified'.\n\n");
                prompt.append("FORMAT: Return ONLY a JSON array of objects with keys: ");
                prompt.append("\"title\", \"description\", \"requirements\" (array), \"skills\" (array), \"industry\", \"salary\".\n");
                prompt.append("Do not include any conversational text or markdown. Just the raw JSON array.\n");
                prompt.append("IMPORTANT: Ensure your output JSON array has exactly ").append(rawDataList.size()).append(" objects, one for each job provided below in order.\n\n");
                prompt.append("Process and strictly structure these ").append(rawDataList.size()).append(" job descriptions:\n\n");
                
                for (int i = 0; i < rawDataList.size(); i++) {
                    prompt.append("### JOB ").append(i).append(" ###\n")
                               .append(rawDataList.get(i))
                               .append("\n\n");
                }

                Map<String, Object> part = new HashMap<>();
                part.put("text", prompt.toString());

                Map<String, Object> content = new HashMap<>();
                content.put("parts", Collections.singletonList(part));

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", Collections.singletonList(content));

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                String url = GEMINI_API_URL + apiKey;
                String response = restTemplate.postForObject(url, entity, String.class);
                
                JsonNode root = objectMapper.readTree(response);
                String textResponse = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
                
                // Clean up Markdown if AI returned it
                if (textResponse.contains("```json")) {
                    textResponse = textResponse.substring(textResponse.indexOf("```json") + 7);
                    textResponse = textResponse.substring(0, textResponse.lastIndexOf("```")).trim();
                } else if (textResponse.contains("```")) {
                    textResponse = textResponse.substring(textResponse.indexOf("```") + 3);
                    textResponse = textResponse.substring(0, textResponse.lastIndexOf("```")).trim();
                }
                
                JsonNode contentJson = objectMapper.readTree(textResponse);
                List<String> results = new ArrayList<>();
                
                if (contentJson.isArray()) {
                    for (JsonNode node : contentJson) {
                        if (node.isObject() && node.has("title") && !node.get("title").asText().isEmpty()) {
                            results.add(objectMapper.writeValueAsString(node));
                        }
                    }
                } else if (contentJson.isObject() && (contentJson.has("jobs") || contentJson.size() > 0)) {
                    JsonNode jobsNode = contentJson.has("jobs") ? contentJson.get("jobs") : contentJson;
                    if (jobsNode.isArray()) {
                        for (JsonNode node : jobsNode) {
                            if (node.isObject() && node.has("title")) {
                                results.add(objectMapper.writeValueAsString(node));
                            }
                        }
                    } else if (jobsNode.isObject() && jobsNode.has("title")) {
                        results.add(objectMapper.writeValueAsString(jobsNode));
                    }
                }
                
                return results;

            } catch (HttpClientErrorException.TooManyRequests e) {
                retryCount++;
                log.warn("Gemini API rate limit hit. Retry attempt {}/{} after pause...", retryCount, maxRetries);
                try {
                    // Exponential backoff: 10s, 20s, 40s
                    Thread.sleep(Math.round(Math.pow(2, retryCount) * 5000)); 
                } catch (InterruptedException ignored) {}
            } catch (Exception e) {
                log.error("Error calling Gemini API for batch: {}", e.getMessage());
                return new ArrayList<>();
            }
        }
        log.error("Gemini API failed after {} retries due to quota limits.", maxRetries);
        return new ArrayList<>();
    }

    public String structureJobData(String rawData) {
        List<String> result = structureJobDataBatch(List.of(rawData));
        return result.isEmpty() ? null : result.get(0);
    }
}
