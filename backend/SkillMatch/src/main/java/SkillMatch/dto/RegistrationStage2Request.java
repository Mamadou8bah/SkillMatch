package SkillMatch.dto;

import SkillMatch.util.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrationStage2Request(
        @NotBlank(message = "Location is required")
        String location,

        @NotBlank(message = "Experience level is required")
        String experienceLevel,

        @NotNull(message = "Role is required")
        Role role,

        @NotBlank(message = "Profession is required")
        String profession,

        @NotBlank(message = "Industry is required")
        String industry,

        String photo
) {
}
