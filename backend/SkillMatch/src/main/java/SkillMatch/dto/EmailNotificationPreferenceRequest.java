package SkillMatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmailNotificationPreferenceRequest {
    @NotNull(message = "enabled is required")
    private Boolean enabled;
}
