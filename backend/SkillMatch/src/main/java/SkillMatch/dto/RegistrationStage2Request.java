package SkillMatch.dto;

import SkillMatch.util.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrationStage2Request(
        @NotBlank(message = "Location is required")
        String location,

        @NotNull(message = "Role is required")
        Role role
) {
}
