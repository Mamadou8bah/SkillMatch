package SkillMatch.util;

import SkillMatch.model.JobPost;
import SkillMatch.model.User;

import java.time.format.DateTimeFormatter;

public class JobMatchEmailContext extends AbstractEmailContext {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d, yyyy");

    @Override
    public <T> void init(T context) {
        User user = (User) context;
        put("firstName", user.getFullName());
        put("logoUrl", "https://res.cloudinary.com/dflsnes44/image/upload/v1770537539/skillmatch-logo_ufunkh.png");
        setTemplateLocation("mailing/job-match-notification");
        setSubject("New job match in your industry - SkillMatch");
        setFrom("mbah18791@gmail.com");
        setTo(user.getEmail());
    }

    public void setJob(JobPost jobPost, String companyName, String descriptionSnippet, String actionUrl) {
        put("jobTitle", safe(jobPost.getTitle(), "New Opportunity"));
        put("companyName", safe(companyName, "SkillMatch Employer"));
        put("industry", safe(jobPost.getIndustry(), "General"));
        put("locationType", jobPost.getLocationType() != null ? jobPost.getLocationType().name() : "N/A");
        put("salary", safe(jobPost.getSalary(), "Not specified"));
        put("descriptionSnippet", safe(descriptionSnippet, "A new role that matches your industry profile is available now."));
        put("jobUrl", actionUrl);
        put("postedAt", jobPost.getPostedAt() != null ? DATE_FORMATTER.format(jobPost.getPostedAt()) : DATE_FORMATTER.format(java.time.LocalDateTime.now()));
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
