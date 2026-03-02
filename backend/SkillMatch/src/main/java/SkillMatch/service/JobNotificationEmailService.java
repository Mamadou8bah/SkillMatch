package SkillMatch.service;

import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.repository.UserRepo;
import SkillMatch.util.JobMatchEmailContext;
import SkillMatch.util.LocationType;
import SkillMatch.util.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobNotificationEmailService {

    private final UserRepo userRepo;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendBaseUrl;

    public void notifyIndustryMatches(JobPost jobPost) {
        if (jobPost == null || jobPost.getIndustry() == null || jobPost.getIndustry().isBlank()) {
            return;
        }

        String normalizedIndustry = jobPost.getIndustry().trim();
        List<User> candidates = userRepo.findNotifiableUsersByRoleAndIndustry(Role.CANDIDATE, normalizedIndustry);
        if (candidates.isEmpty()) {
            return;
        }

        String actionUrl = buildActionUrl(jobPost);
        String companyName = resolveCompanyName(jobPost);
        String descriptionSnippet = summarize(jobPost.getDescription(), 220);

        for (User candidate : candidates) {
            try {
                JobMatchEmailContext context = new JobMatchEmailContext();
                context.init(candidate);
                context.setJob(jobPost, companyName, descriptionSnippet, actionUrl);
                emailService.sendMail(context);
            } catch (Exception ex) {
                log.error("Failed to queue job alert email for user {} and job {}", candidate.getId(), jobPost.getId(), ex);
            }
        }

        log.info("Queued {} industry match emails for job {}", candidates.size(), jobPost.getId());
    }

    public void sendTestNotification(String recipientEmail, String adminName) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        User recipient = new User();
        recipient.setEmail(recipientEmail.trim());
        recipient.setFullName((adminName == null || adminName.isBlank()) ? "Admin User" : adminName);

        JobPost sampleJob = new JobPost();
        sampleJob.setTitle("Senior Product Designer");
        sampleJob.setIndustry("Design");
        sampleJob.setLocationType(LocationType.REMOTE);
        sampleJob.setSalary("Competitive");
        sampleJob.setDescription("Lead product design initiatives, collaborate with engineering, and ship user-centered experiences.");
        sampleJob.setPostedAt(java.time.LocalDateTime.now());
        sampleJob.setJobUrl(frontendBaseUrl + "/jobs");
        sampleJob.setCompanyName("SkillMatch Demo");

        JobMatchEmailContext context = new JobMatchEmailContext();
        context.init(recipient);
        context.setJob(
                sampleJob,
                sampleJob.getCompanyName(),
                summarize(sampleJob.getDescription(), 220),
                sampleJob.getJobUrl()
        );
        emailService.sendMail(context);
    }

    private String buildActionUrl(JobPost jobPost) {
        if (jobPost.getJobUrl() != null && !jobPost.getJobUrl().isBlank()) {
            return jobPost.getJobUrl();
        }
        if (jobPost.getId() == null) {
            return frontendBaseUrl + "/jobs";
        }
        return frontendBaseUrl + "/jobs/" + jobPost.getId();
    }

    private String resolveCompanyName(JobPost jobPost) {
        if (jobPost.getCompanyName() != null && !jobPost.getCompanyName().isBlank()) {
            return jobPost.getCompanyName();
        }
        if (jobPost.getEmployer() != null && jobPost.getEmployer().getCompanyName() != null
                && !jobPost.getEmployer().getCompanyName().isBlank()) {
            return jobPost.getEmployer().getCompanyName();
        }
        return "SkillMatch Employer";
    }

    private String summarize(String text, int maxLength) {
        if (text == null || text.isBlank()) {
            return "A new role that matches your industry profile is available now.";
        }
        String normalized = text.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= maxLength) {
            return normalized;
        }
        return normalized.substring(0, maxLength - 3).trim() + "...";
    }
}
