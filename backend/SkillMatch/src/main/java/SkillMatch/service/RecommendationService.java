package SkillMatch.service;

import SkillMatch.model.*;
import SkillMatch.repository.JobPostRepo;
import SkillMatch.repository.UserRepo;
import SkillMatch.repository.UserInteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final JobPostRepo jobPostRepo;
    private final UserRepo userRepo;
    private final UserInteractionRepository interactionRepo;
    private final ConnectionService connectionService;
    private final org.springframework.web.client.RestTemplate restTemplate;

    private static final String ML_ENGINE_URL = "http://localhost:5000/recommend";

    /**
     * Recommends JobPosts for a Candidate based on weighted scoring.
     */
    public List<JobPost> recommendJobs(User candidate) {
        List<JobPost> allJobs = jobPostRepo.findAll();
        if (allJobs.isEmpty()) return Collections.emptyList();

        Map<Long, Double> semanticScores = new HashMap<>();
        try {
            String userNarrative = buildUserNarrative(candidate);
            List<Map<String, Object>> jobsData = allJobs.stream().map(j -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", j.getId());
                map.put("description", buildJobNarrative(j));
                return map;
            }).collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("user_profile", userNarrative);
            request.put("jobs", jobsData);

            List<Map<String, Object>> mlResults = restTemplate.postForObject(ML_ENGINE_URL + "/jobs", request, List.class);
            if (mlResults != null) {
                mlResults.forEach(r -> semanticScores.put(Long.valueOf(r.get("id").toString()), Double.valueOf(r.get("score").toString())));
            }
        } catch (Exception e) {
            System.err.println("ML Engine unavailable, semantic score will be 0: " + e.getMessage());
        }

        Set<String> candidateSkills = candidate.getSkills().stream()
                .map(s -> s.getTitle().toLowerCase().trim())
                .collect(Collectors.toSet());

        double totalExp = calculateTotalExperience(candidate);

        List<JobMatch> matchedJobs = allJobs.stream().map(job -> {
                    double semantic = semanticScores.getOrDefault(job.getId(), 0.0);
                    double skillMatch = calculateSkillOverlap(candidateSkills, job.getRequiredSkills());
                    double expFit = calculateExperienceFit(totalExp, job.getTitle());
                    double connBoost = calculateConnectionBoost(candidate, job);
                    double recentInterest = calculateInterestScore(candidate, job);

                    // FINAL WEIGHTED FORMULA
                    double finalScore =
                            (0.45 * semantic) +
                                    (0.25 * (skillMatch / 100.0)) +
                                    (0.15 * (expFit / 100.0)) +
                                    (0.10 * (connBoost / 100.0)) +
                                    (0.05 * (recentInterest / 100.0));

                    return new JobMatch(job, finalScore * 100.0);
                })
                .filter(jm -> jm.getScore() > 5)
                .sorted(Comparator.comparingDouble(JobMatch::getScore).reversed())
                .limit(20)
                .collect(Collectors.toList());

        return matchedJobs.stream().map(JobMatch::getJob).collect(Collectors.toList());
    }

    private String buildUserNarrative(User user) {
        StringBuilder narrative = new StringBuilder();
        String latestTitle = (user.getExperiences() == null || user.getExperiences().isEmpty()) ? "Professional" : user.getExperiences().get(0).getJobTitle();
        double years = calculateTotalExperience(user);

        narrative.append(latestTitle)
                .append(" with ")
                .append(String.format("%.1f", years))
                .append(" years of experience. ");

        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            narrative.append("Skilled in: ")
                    .append(user.getSkills().stream().map(Skill::getTitle).collect(Collectors.joining(", ")))
                    .append(". ");
        }

        if (user.getExperiences() != null) {
            user.getExperiences().forEach(e -> {
                narrative.append("Worked at ").append(e.getCompanyName()).append(" as ").append(e.getJobTitle()).append(". ");
                if (e.getDescription() != null) narrative.append(e.getDescription()).append(" ");
            });
        }

        return narrative.toString();
    }

    private String buildUserProfileString(User user) {
        return buildUserNarrative(user);
    }

    private String buildJobNarrative(JobPost job) {
        StringBuilder sb = new StringBuilder();
        sb.append(job.getTitle()).append(". ");
        sb.append(job.getDescription()).append(". ");
        if (!job.getRequiredSkills().isEmpty()) {
            sb.append("Required skills: ")
                    .append(job.getRequiredSkills().stream().map(Skill::getTitle).collect(Collectors.joining(", ")));
        }
        return sb.toString();
    }

    private double calculateSkillOverlap(Set<String> candidateSkills, List<Skill> jobSkills) {
        if (jobSkills == null || jobSkills.isEmpty()) return 50.0;
        Set<String> required = jobSkills.stream().map(s -> s.getTitle().toLowerCase().trim()).collect(Collectors.toSet());
        long matches = required.stream().filter(candidateSkills::contains).count();
        return (double) matches / required.size() * 100.0;
    }

    private double calculateExperienceFit(double candidateYears, String jobTitle) {
        String title = jobTitle.toLowerCase();
        int reqYears = 2; // Default
        if (title.contains("senior") || title.contains("sr") || title.contains("lead")) reqYears = 5;
        else if (title.contains("junior") || title.contains("jr") || title.contains("entry") || title.contains("intern"))
            reqYears = 0;

        double diff = Math.abs(candidateYears - reqYears);
        if (diff <= 1) return 100.0;
        if (diff <= 3) return 70.0;
        return 40.0;
    }

    private double calculateConnectionBoost(User user, JobPost job) {
        // Boost if user is connected to anyone at the employer's company
        if (job.getEmployer() == null || job.getEmployer().getUser() == null) return 0.0;
        // In a real system, we'd check if any connection of 'user' works at 'job.getEmployer()'
        // For now, return 10 if there are any mutual connections with the employer (simplified)
        return 10.0;
    }

    private double calculateInterestScore(User user, JobPost job) {
        long clicks = interactionRepo.countByUserAndJobPostAndInteractionType(user, job, "CLICK");
        if (clicks > 3) return 100.0;
        if (clicks > 0) return 50.0;
        return 0.0;
    }

    /**
     * Recommends Candidates for an Employer/JobPost.
     */
    public List<User> recommendCandidates(JobPost job) {
        List<User> allCandidates = userRepo.findAll().stream()
                .filter(u -> u.getRole() != null && (u.getRole().name().equals("CANDIDATE") || u.getRole().name().equals("USER")))
                .collect(Collectors.toList());

        Map<Long, Double> semanticScores = new HashMap<>();
        try {
            String jobNarrative = buildJobNarrative(job);
            List<Map<String, Object>> candData = allCandidates.stream().map(u -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId());
                map.put("profile", buildUserNarrative(u));
                return map;
            }).collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("job_description", jobNarrative);
            request.put("candidates", candData);

            List<Map<String, Object>> mlResults = restTemplate.postForObject(ML_ENGINE_URL + "/candidates", request, List.class);
            if (mlResults != null) {
                mlResults.forEach(r -> semanticScores.put(Long.valueOf(r.get("id").toString()), Double.valueOf(r.get("score").toString())));
            }
        } catch (Exception e) {
            System.err.println("ML Engine unavailable: " + e.getMessage());
        }

        Set<String> requiredSkills = job.getRequiredSkills().stream()
                .map(s -> s.getTitle().toLowerCase().trim())
                .collect(Collectors.toSet());

        return allCandidates.stream()
                .map(candidate -> {
                    double semantic = semanticScores.getOrDefault(candidate.getId(), 0.0);
                    double skillMatch = calculateSkillOverlap(
                            candidate.getSkills().stream().map(s -> s.getTitle().toLowerCase().trim()).collect(Collectors.toSet()),
                            job.getRequiredSkills()
                    );
                    double expFit = calculateExperienceFit(calculateTotalExperience(candidate), job.getTitle());

                    double finalScore = (0.5 * semantic) + (0.3 * (skillMatch / 100.0)) + (0.2 * (expFit / 100.0));
                    return new UserMatch(candidate, finalScore * 100.0);
                })
                .filter(um -> um.getScore() > 10)
                .sorted(Comparator.comparingDouble(UserMatch::getScore).reversed())
                .map(UserMatch::getUser)
                .limit(15)
                .collect(Collectors.toList());
    }

    /**
     * Recommends connections for a user based on mutual connections, shared skills, alumni, and shared companies.
     */
    public List<User> recommendConnections(User user) {
        List<User> myConnections = connectionService.getConnections(user);
        Set<Long> myConnIds = myConnections.stream().map(User::getId).collect(Collectors.toSet());
        myConnIds.add(user.getId());

        Map<User, Double> scores = new HashMap<>();

        // 1. Mutual Connections (Weight: 5.0 per mutual)
        for (User friend : myConnections) {
            List<User> friendsOfFriend = connectionService.getConnections(friend);
            for (User potential : friendsOfFriend) {
                if (!myConnIds.contains(potential.getId())) {
                    scores.put(potential, scores.getOrDefault(potential, 0.0) + 5.0);
                }
            }
        }

        List<User> others = userRepo.findAll().stream()
                .filter(u -> !myConnIds.contains(u.getId()))
                .collect(Collectors.toList());

        Set<String> mySkills = user.getSkills().stream()
                .map(s -> s.getTitle().toLowerCase().trim())
                .collect(Collectors.toSet());

        Set<String> mySchools = user.getEducations().stream()
                .map(e -> e.getInstitutionName().toLowerCase().trim())
                .collect(Collectors.toSet());

        Set<String> myCompanies = user.getExperiences().stream()
                .map(ex -> ex.getCompanyName().toLowerCase().trim())
                .collect(Collectors.toSet());

        // 5. ML Similarity (AI matching on profiles) - Fallback to current heuristic if ML fails
        try {
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("user_profile", buildUserProfileString(user));
            reqBody.put("others", others.stream().map(u -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("profile", buildUserProfileString(u));
                return m;
            }).collect(Collectors.toList()));

            List<Map<String, Object>> mlResults = restTemplate.postForObject(ML_ENGINE_URL + "/similar-users", reqBody, List.class);
            if (mlResults != null) {
                for (Map<String, Object> res : mlResults) {
                    Long oid = Long.valueOf(res.get("id").toString());
                    Double mlScore = Double.valueOf(res.get("score").toString());
                    User potential = others.stream().filter(u -> u.getId().equals(oid)).findFirst().orElse(null);
                    if (potential != null) {
                        scores.put(potential, scores.getOrDefault(potential, 0.0) + (mlScore * 20.0)); // Weight ML score
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("ML Connection recommendation failed: " + e.getMessage());
        }

        for (User potential : others) {
            double score = scores.getOrDefault(potential, 0.0);

            // 2. Shared Skills (Weight: 3.0 per skill)
            long sharedSkills = potential.getSkills().stream()
                    .filter(s -> mySkills.contains(s.getTitle().toLowerCase().trim()))
                    .count();
            score += sharedSkills * 3.0;

            // 3. Alumni (Weight: 10.0 per shared school)
            long sharedSchools = potential.getEducations().stream()
                    .filter(e -> mySchools.contains(e.getInstitutionName().toLowerCase().trim()))
                    .count();
            score += sharedSchools * 10.0;

            // 4. Colleagues (Weight: 15.0 per shared company)
            long sharedCompanies = potential.getExperiences().stream()
                    .filter(ex -> myCompanies.contains(ex.getCompanyName().toLowerCase().trim()))
                    .count();
            score += sharedCompanies * 15.0;

            if (score > 0) {
                scores.put(potential, score);
            }
        }

        return scores.entrySet().stream()
                .sorted(Map.Entry.<User, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .limit(20)
                .collect(Collectors.toList());
    }

    private double calculateJobMatchScore(JobPost job, Set<String> candidateSkills, User candidate) {
        double score = 0;

        // Skill Matching (Max 60 points)
        if (job.getRequiredSkills() != null && !job.getRequiredSkills().isEmpty()) {
            long matches = job.getRequiredSkills().stream()
                    .filter(s -> candidateSkills.contains(s.getTitle().toLowerCase().trim()))
                    .count();
            score += ((double) matches / job.getRequiredSkills().size()) * 60;
        }

        // Location Matching (Max 20 points)
        String userLoc = candidate.getLocation();
        if (userLoc != null && job.getEmployer() != null && job.getEmployer().getLocation() != null) {
            if (userLoc.equalsIgnoreCase(job.getEmployer().getLocation())) {
                score += 20;
            } else if (job.getLocationType().name().equals("REMOTE")) {
                score += 15;
            }
        } else if (job.getLocationType().name().equals("REMOTE")) {
            score += 15;
        }

        // Seniority/Title Matching (Max 20 points)
        String jobTitle = job.getTitle().toLowerCase();
        boolean isSeniorJob = jobTitle.contains("senior") || jobTitle.contains("lead") || jobTitle.contains("sr");
        boolean isJuniorJob = jobTitle.contains("junior") || jobTitle.contains("intern") || jobTitle.contains("jr");

        double totalYears = calculateTotalExperience(candidate);
        if (isSeniorJob && totalYears >= 5) score += 20;
        else if (isJuniorJob && totalYears < 2) score += 20;
        else if (!isSeniorJob && !isJuniorJob && totalYears >= 2 && totalYears < 6) score += 20;
        else score += 5; // Partial match for experience

        return score;
    }

    private double calculateCandidateMatchScore(User candidate, Set<String> requiredSkills, JobPost job) {
        double score = 0;
        Set<String> candidateSkills = candidate.getSkills().stream()
                .map(s -> s.getTitle().toLowerCase().trim())
                .collect(Collectors.toSet());

        // Skill Match (60%)
        long matches = candidateSkills.stream()
                .filter(requiredSkills::contains)
                .count();
        score += ((double) matches / requiredSkills.size()) * 60;

        // Experience Match (40%)
        double totalYears = calculateTotalExperience(candidate);
        String jobTitle = job.getTitle().toLowerCase();
        if (jobTitle.contains("senior") && totalYears >= 5) score += 40;
        else if (jobTitle.contains("junior") && totalYears < 3) score += 40;
        else if (totalYears >= 1) score += 20;

        return score;
    }

    private double calculateTotalExperience(User user) {
        if (user.getExperiences() == null) return 0;
        return user.getExperiences().stream()
                .mapToDouble(ex -> {
                    java.time.LocalDate start = ex.getStartDate();
                    java.time.LocalDate end = ex.getEndDate() != null ? ex.getEndDate() : java.time.LocalDate.now();
                    return java.time.temporal.ChronoUnit.MONTHS.between(start, end) / 12.0;
                })
                .sum();
    }


    @lombok.Value
    private static class JobMatch {
        JobPost job;
        double score;
    }

    @lombok.Value
    private static class UserMatch {
        User user;
        double score;
    }
}
