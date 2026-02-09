package SkillMatch.service;

import SkillMatch.dto.JobicyJobDTO;
import SkillMatch.dto.JobicyResponseDTO;
import SkillMatch.dto.JobResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalJobService {

    private final RestTemplate restTemplate;
    private static final String JOBICY_API_URL = "https://jobicy.com/api/v2/remote-jobs";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Cacheable(value = "jobicyJobs")
    public List<JobResponseDTO> fetchRemoteJobs() {
        log.info("Fetching jobs from Jobicy API...");
        try {
            JobicyResponseDTO response = restTemplate.getForObject(JOBICY_API_URL, JobicyResponseDTO.class);
            if (response != null && response.isSuccess() && response.getJobs() != null) {
                return response.getJobs().stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Error fetching jobs from Jobicy", e);
        }
        return new ArrayList<>();
    }

    @CacheEvict(value = "jobicyJobs", allEntries = true)
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    public void evictJobicyCache() {
        log.info("Evicting Jobicy jobs cache");
    }

    private JobResponseDTO convertToDTO(JobicyJobDTO externalJob) {
        LocalDateTime postedAt = null;
        try {
            if (externalJob.getPubDate() != null) {
                postedAt = LocalDateTime.parse(externalJob.getPubDate(), FORMATTER);
            }
        } catch (Exception e) {
            log.warn("Could not parse date: {}", externalJob.getPubDate());
            postedAt = LocalDateTime.now();
        }

        return JobResponseDTO.builder()
                .id(externalJob.getId())
                .title(externalJob.getJobTitle())
                .description(externalJob.getJobDescription())
                .employer(JobResponseDTO.EmployerInfo.builder()
                        .name(externalJob.getCompanyName())
                        .build())
                .locationType(externalJob.getJobGeo())
                .salary(externalJob.getSalary())
                .url(externalJob.getUrl())
                .postedAt(postedAt)
                .source("Jobicy")
                .build();
    }
}
