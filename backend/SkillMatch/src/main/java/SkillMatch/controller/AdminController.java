package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.service.UserService;
import SkillMatch.service.JobPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final JobPostService jobPostService;

    @GetMapping("/stats")
    @org.springframework.cache.annotation.Cacheable(value = "adminStats", key = "'dashboard'")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userService.countUsers());
        stats.put("totalJobs", jobPostService.countJobs());
        stats.put("activeApplications", 0); // Placeholder if no application service yet
        stats.put("newSignups", 0); // Placeholder
        
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved successfully", stats));
    }
}
