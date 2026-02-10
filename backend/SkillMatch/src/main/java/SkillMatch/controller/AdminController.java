package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.dto.RecentActivityDTO;
import SkillMatch.service.UserService;
import SkillMatch.service.JobPostService;
import SkillMatch.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final JobPostService jobPostService;
    private final ApplicationService applicationService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userService.countUsers());
        stats.put("totalJobs", jobPostService.countJobs());
        stats.put("activeApplications", applicationService.countApplications());
        stats.put("newSignups", userService.countRecentUsers(7));
        
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved successfully", stats));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<RecentActivityDTO>>> getRecentActivities() {
        List<RecentActivityDTO> activities = new ArrayList<>();
        
        // Add recent users
        userService.getUsers().stream().limit(5).forEach(u -> {
            activities.add(RecentActivityDTO.builder()
                .action("New Signup")
                .entity("User Account")
                .user(u.getFullName())
                .date(java.time.LocalDateTime.now().minusHours(2)) // Simulated time for mockup data
                .status("success")
                .build());
        });

        // Add recent jobs
        jobPostService.getRecentJobs(5).forEach(j -> {
            activities.add(RecentActivityDTO.builder()
                .action("Job Posted")
                .entity(j.getTitle())
                .user(j.getCompanyName() != null ? j.getCompanyName() : "External Source")
                .date(j.getPostedAt())
                .status("warning")
                .build());
        });
        
        // Sort by date descending
        activities.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", activities));
    }
}
