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
public class JobResponseDTO {
    private String id;
    private String title;
    private String description;
    private EmployerInfo employer;
    private String locationType;
    private String salary;
    private String url;
    private String industry;
    private String type;
    private List<String> skills;
    private List<String> requirements;
    private LocalDateTime postedAt;
    private String source; // "Jobicy" or "Own"

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployerInfo {
        private String name;
        private String logo;
    }
}
