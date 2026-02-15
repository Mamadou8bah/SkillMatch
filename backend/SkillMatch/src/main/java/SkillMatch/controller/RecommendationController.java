package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.dto.CandidateJobMatchDTO;
import SkillMatch.dto.JobResponseDTO;
import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.repository.JobPostRepo;
import SkillMatch.service.CandidateJobMatchService;
import SkillMatch.service.JobPostService;
import SkillMatch.service.RecommendationService;
import SkillMatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;
    private final UserService userService;
    private final CandidateJobMatchService candidateJobMatchService;
    private final JobPostRepo jobPostRepo;
    private final JobPostService jobPostService;

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobPost>>> getJobRecommendations() {
        User user = userService.getLogInUser();
        List<JobPost> recommendations = recommendationService.recommendJobs(user);
        return ResponseEntity.ok(ApiResponse.success("Job recommendations retrieved", recommendations));
    }

    @GetMapping("/jobs/all")
    public ResponseEntity<ApiResponse<List<JobResponseDTO>>> getAllRankedJobs() {
        User user = userService.getLogInUser();
        List<JobPost> rankedJobs = recommendationService.recommendAllJobs(user);
        List<JobResponseDTO> dtos = rankedJobs.stream()
                .map(jobPostService::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All jobs retrieved and ranked", dtos));
    }

    @GetMapping("/candidates/{jobId}")
    public ResponseEntity<ApiResponse<List<User>>> getCandidateRecommendations(@PathVariable Long jobId) {
        JobPost job = jobPostRepo.findById(jobId)
                .orElseThrow(() -> new SkillMatch.exception.ResourceNotFoundException("Job not found"));
        List<User> recommendations = recommendationService.recommendCandidates(job);
        return ResponseEntity.ok(ApiResponse.success("Candidate recommendations retrieved", recommendations));
    }

    @GetMapping("/matches")
    public ResponseEntity<ApiResponse<List<CandidateJobMatchDTO>>> getPrecomputedMatches(@RequestParam(defaultValue = "20") int limit) {
        User user = userService.getLogInUser();
        List<CandidateJobMatchDTO> matches = candidateJobMatchService.getTopMatches(user, limit);
        return ResponseEntity.ok(ApiResponse.success("Precomputed job matches retrieved", matches));
    }

    @GetMapping("/connections")
    public ResponseEntity<ApiResponse<List<User>>> getConnectionRecommendations() {
        User user = userService.getLogInUser();
        List<User> recommendations = recommendationService.recommendConnections(user);
        return ResponseEntity.ok(ApiResponse.success("Connection recommendations retrieved", recommendations));
    }
}
