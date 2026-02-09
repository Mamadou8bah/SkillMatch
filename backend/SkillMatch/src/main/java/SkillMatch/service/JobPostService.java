package SkillMatch.service;

import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.dto.JobResponseDTO;
import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.model.UserInteraction;
import SkillMatch.repository.JobPostRepo;
import SkillMatch.repository.UserInteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        // Fetch DB jobs
        Pageable pageable= PageRequest.of(pageNo, readCount);
        Page<JobPost> page=repo.findAll(pageable);
        List<JobPost> dbPosts = page.getContent();

        List<JobResponseDTO> mergedList = new ArrayList<>();

        // Map DB jobs to DTO
        mergedList.addAll(dbPosts.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList()));

        // Fetch API jobs
        mergedList.addAll(externalJobService.fetchRemoteJobs());

        // Sort by pubDate descending
        return mergedList.stream()
                .sorted(Comparator.comparing(JobResponseDTO::getPostedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private JobResponseDTO convertToResponseDTO(JobPost jobPost) {
        return JobResponseDTO.builder()
                .id(String.valueOf(jobPost.getId()))
                .title(jobPost.getTitle())
                .description(jobPost.getDescription())
                .employer(JobResponseDTO.EmployerInfo.builder()
                        .name(jobPost.getEmployer() != null ? jobPost.getEmployer().getCompanyName() : "N/A")
                        .logo(jobPost.getEmployer() != null ? jobPost.getEmployer().getPictureUrl() : "")
                        .build())
                .locationType(jobPost.getLocationType() != null ? jobPost.getLocationType().name() : "N/A")
                .salary(String.valueOf(jobPost.getSalary()))
                .postedAt(jobPost.getPostedAt())
                .source("Own")
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



}
