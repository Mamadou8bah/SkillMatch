package SkillMatch.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record RegistrationStage3Request(
        String companyName,

        String industry,

        String description,

        @NotEmpty(message = "Skills are required")
        List<String> skills
) {
}
