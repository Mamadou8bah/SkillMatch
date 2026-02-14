package SkillMatch.service;

import SkillMatch.exception.AuthenticationException;
import SkillMatch.exception.DuplicateApplicationException;
import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.model.Application;
import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.repository.ApplicationRepository;
import SkillMatch.repository.UserRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationService {


    private final ApplicationRepository repository;

    private final JobPostService jobPostService;

    private final CloudinaryService cloudinaryService;

    private final UserRepo userRepository;

    @Transactional
    public Application submitApplication(Long jobId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        Optional<Application> existingApp = repository.findByUser_IdAndJobPost_Id(user.getId(), jobId);

        if (existingApp.isPresent()) {
            throw new DuplicateApplicationException("You have already applied to this job");
        }
        JobPost jobPost = jobPostService.getJobPostById(jobId);

        if (jobPost == null) {
            throw new ResourceNotFoundException("Job Post Not Found");
        }
        Application application = Application.builder()
                .status("Submitted")
                .jobPost(jobPost)
                .user(user)
                .build();

        return repository.save(application);
    }

    public void deleteApplication(Long applicationId) {
        Application app = repository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        repository.delete(app);
    }

    public Application getApplicationById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    public List<Application> getAlApplicationsPerJob(long jobId) {
        JobPost jobPost = jobPostService.getJobPostById(jobId);
        if (jobPost == null) {
            throw new ResourceNotFoundException("Job Post Not Found");
        }
        return repository.findApplicationsByJobPost_Id(jobId);
    }

    public List<Application> getAllUserApplications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new AuthenticationException("User not logged in");
        }
        return repository.findApplicationsByUser_Id(user.getId());
    }

    public long countApplications() {
        return repository.count();
    }
}
