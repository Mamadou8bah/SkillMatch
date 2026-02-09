package SkillMatch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ExperienceDTO {
    private String companyName;
    private String jobTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;


}
