package SkillMatch.service;

import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.dto.JobResponseDTO;
import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.model.UserInteraction;
import SkillMatch.repository.JobPostRepo;
import SkillMatch.repository.UserInteractionRepository;
import SkillMatch.model.Skill;
import SkillMatch.util.LocationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobPostService {


    private final JobPostRepo repo;
    private final UserInteractionRepository interactionRepo;
    private final ExternalJobService externalJobService;

    public JobPost addJob(JobPost jobPost){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        jobPost.setEmployer(user.getEmployer());
        return repo.save(jobPost);
    }

    public List<JobResponseDTO> getJobPost(int pageNo, int readCount) {
        // Fetch DB jobs (including synced external ones)
        Pageable pageable = PageRequest.of(pageNo, readCount);
        Page<JobPost> page = repo.findAll(pageable);
        
        return page.getContent().stream()
                .map(this::convertToResponseDTO)
                .sorted(Comparator.comparing(JobResponseDTO::getPostedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private JobResponseDTO convertToResponseDTO(JobPost jobPost) {
        return JobResponseDTO.builder()
                .id(String.valueOf(jobPost.getId()))
                .title(jobPost.getTitle())
                .description(jobPost.getDescription())
                .employer(JobResponseDTO.EmployerInfo.builder()
                        .name(jobPost.getCompanyName() != null ? jobPost.getCompanyName() : (jobPost.getEmployer() != null ? jobPost.getEmployer().getCompanyName() : "N/A"))
                        .logo(jobPost.getCompanyLogo() != null ? jobPost.getCompanyLogo() : (jobPost.getEmployer() != null ? jobPost.getEmployer().getPictureUrl() : ""))
                        .build())
                .locationType(jobPost.getLocationType() != null ? jobPost.getLocationType().name() : "N/A")
                .salary(jobPost.getSalary())
                .url(jobPost.getJobUrl())
                .postedAt(jobPost.getPostedAt())
                .source(jobPost.getSource() != null ? jobPost.getSource() : "Own")
                .type(jobPost.getJobType())
                .industry(jobPost.getIndustry())
                .requirements(jobPost.getRequirements())
                .skills(jobPost.getRequiredSkills().stream().map(Skill::getTitle).collect(Collectors.toList()))
                .build();
    }


    public JobPost getJobPostById(long id){
        JobPost jobPost = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        // Log interaction on view
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User user) {
                interactionRepo.save(UserInteraction.builder()
                        .user(user)
                        .jobPost(jobPost)
                        .interactionType("CLICK")
                        .build());
            }
        } catch (Exception e) {
            // Silently fail if auth is missing or detached
        }

        return jobPost;
    }

    public List<JobPost> searchPosts(String title){
        List<JobPost>posts=repo.findByTitleContainingIgnoreCase(title);
        return posts;
    }

    public JobPost updateJobPost(long id, JobPost newPost){
        JobPost oldPost=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Job post not found"));
        if (newPost.getTitle() != null) {
            oldPost.setTitle(newPost.getTitle());
        }
        if (newPost.getDescription() != null) {
            oldPost.setDescription(newPost.getDescription());
        }
        if (newPost.getSalary() != 0) {
            oldPost.setSalary(newPost.getSalary());
        }
        if (newPost.getRequiredSkills() != null) {
            oldPost.setRequiredSkills(newPost.getRequiredSkills());
        }
        return repo.save(oldPost);
    }

    public List<JobPost> getJobsByLoggedInEmployer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return repo.findByEmployerId(user.getEmployer().getId());
    }

    public JobPost deletePost(long id){
        JobPost post=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Job post not found"));
        repo.deleteById(id);
        return post;
    }

    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    public void syncExternalJobs() {
        log.info("Starting scheduled job sync...");
        
        try {
            List<JobResponseDTO> gamjobs = externalJobService.fetchGamjobs();
            saveExternalJobs(gamjobs, "Gamjobs");
        } catch (Exception e) { log.error("Gamjobs sync failed", e); }

        try {
            List<JobResponseDTO> waveJobs = externalJobService.fetchWaveJobs();
            saveExternalJobs(waveJobs, "Wave");
        } catch (Exception e) { log.error("Wave sync failed", e); }

        try {
            List<JobResponseDTO> iomJobs = externalJobService.fetchIomGambiaJobs();
            saveExternalJobs(iomJobs, "IOMGambia");
        } catch (Exception e) { log.error("IOM sync failed", e); }

        try {
            List<JobResponseDTO> mojJobs = externalJobService.fetchMojJobs();
            saveExternalJobs(mojJobs, "MOJGambia");
        } catch (Exception e) { log.error("MOJ sync failed", e); }

        try {
            List<JobResponseDTO> unJobs = externalJobService.fetchUnJobs();
            saveExternalJobs(unJobs, "UNJobs");
        } catch (Exception e) { log.error("UNJobs sync failed", e); }

        try {
            List<JobResponseDTO> primeforgeJobs = externalJobService.fetchPrimeforgeJobs();
            saveExternalJobs(primeforgeJobs, "Primeforge");
        } catch (Exception e) { log.error("Primeforge sync failed", e); }
        
        log.info("Sync completed.");
    }

    private void saveExternalJobs(List<JobResponseDTO> jobs, String source) {
        log.info("Processing {} jobs from {}", jobs.size(), source);
        int batchSize = 5;
        for (int i = 0; i < jobs.size(); i += batchSize) {
            int end = Math.min(i + batchSize, jobs.size());
            List<JobResponseDTO> batch = jobs.subList(i, end);
            try {
                List<JobResponseDTO> structuredBatch = externalJobService.structureBatchWithAI(batch);
                for (JobResponseDTO dto : structuredBatch) {
                    this.persistExternalJob(dto, source);
                }
                if (end < jobs.size()) Thread.sleep(1000); 
            } catch (Exception e) {
                log.error("Batch error: {}", e.getMessage());
                for (JobResponseDTO dto : batch) this.persistExternalJob(dto, source);
            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void persistExternalJob(JobResponseDTO dto, String source) {
        try {
            JobPost post = new JobPost();
            post.setExternalId(dto.getId()); 
            post.setTitle(dto.getTitle());
            post.setDescription(dto.getDescription());
            post.setCompanyName(dto.getEmployer() != null ? dto.getEmployer().getName() : "N/A");
            post.setCompanyLogo(dto.getEmployer() != null ? dto.getEmployer().getLogo() : "");
            post.setJobUrl(dto.getUrl());
            post.setSource(source);
            post.setIndustry(dto.getIndustry());
            post.setJobType(dto.getType());
            post.setLocationType(mapToLocationType(dto.getLocationType()));
            post.setSalary(dto.getSalary() != null ? dto.getSalary() : "N/A");
            post.setPostedAt(dto.getPostedAt() != null ? dto.getPostedAt() : LocalDateTime.now());

            List<Skill> skills = new ArrayList<>();
            if (dto.getSkills() != null) {
                for (String sn : dto.getSkills()) {
                    Skill s = new Skill(); s.setTitle(sn); s.setJobPost(post); skills.add(s);
                }
            }
            post.setRequiredSkills(skills);
            repo.saveAndFlush(post);
        } catch (DataIntegrityViolationException e) {
            log.info("Job already exists: {}", dto.getTitle());
        } catch (Exception e) {
            log.error("Persist error: {}", e.getMessage());
        }
    }

    private LocationType mapToLocationType(String loc) {
        if (loc == null) return LocationType.ONSITE;
        String l = loc.toLowerCase();
        if (l.contains("remote")) return LocationType.REMOTE;
        if (l.contains("hybrid")) return LocationType.HYBRID;
        return LocationType.ONSITE;
    }
}
