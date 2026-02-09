package SkillMatch.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmployerDTO {
    private String  companyName;
    private String website;
    private String industry;
    private String location;
    private String description;


}
