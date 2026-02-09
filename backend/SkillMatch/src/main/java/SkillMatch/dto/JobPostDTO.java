package SkillMatch.dto;

import SkillMatch.model.Employer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class JobPostDTO {
    private String title;
    private Employer employerName;


}
