package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.repository.JobPostRepo;
import SkillMatch.service.RecommendationService;
import SkillMatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;
    private final UserService userService;
    private final JobPostRepo jobPostRepo;

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobPost>>> getJobRecommendations() {
        User user = userService.getLogInUser();
        List<JobPost> recommendations = recommendationService.recommendJobs(user);
        return ResponseEntity.ok(ApiResponse.success("Job recommendations retrieved", recommendations));
    }

    @GetMapping("/candidates/{jobId}")
    public ResponseEntity<ApiResponse<List<User>>> getCandidateRecommendations(@PathVariable Long jobId) {
        JobPost job = jobPostRepo.findById(jobId)
                .orElseThrow(() -> new SkillMatch.exception.ResourceNotFoundException("Job not found"));
        List<User> recommendations = recommendationService.recommendCandidates(job);
        return ResponseEntity.ok(ApiResponse.success("Candidate recommendations retrieved", recommendations));
    }

    @GetMapping("/connections")
    public ResponseEntity<ApiResponse<List<User>>> getConnectionRecommendations() {
        User user = userService.getLogInUser();
        List<User> recommendations = recommendationService.recommendConnections(user);
        return ResponseEntity.ok(ApiResponse.success("Connection recommendations retrieved", recommendations));
    }
}
