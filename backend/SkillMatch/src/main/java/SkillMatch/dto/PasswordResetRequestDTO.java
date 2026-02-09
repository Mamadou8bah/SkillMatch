package SkillMatch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PasswordResetRequestDTO {
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
}
