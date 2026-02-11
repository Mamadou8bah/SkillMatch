package SkillMatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateJobMatchDTO {
    private Long jobId;
    private String title;
    private String companyName;
    private String companyLogo;
    private String locationType;
    private String jobUrl;
    private String source;
    private double score;
    private LocalDateTime computedAt;
    private List<String> requiredSkills;
}
