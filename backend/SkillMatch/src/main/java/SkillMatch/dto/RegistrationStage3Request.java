package SkillMatch.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistrationStage3Request(
        @NotBlank(message = "Company name is required")
        String companyName,

        @NotBlank(message = "Industry is required")
        String industry,

        @NotBlank(message = "Description is required")
        String description
) {
}
