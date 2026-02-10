package SkillMatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecentActivityDTO {
    private String action;
    private String entity;
    private String user;
    private LocalDateTime date;
    private String status; // e.g. "success", "warning", "danger" for badges
}
