package SkillMatch.dto;

import SkillMatch.util.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrationStage2Request(
        String location,
        String experienceLevel,
        Role role,
        String profession,
        String industry,
        String photo
) {
}
