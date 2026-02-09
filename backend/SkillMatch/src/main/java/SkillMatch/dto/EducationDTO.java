package SkillMatch.dto;

import SkillMatch.util.EducationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EducationDTO {
    private String degree;
    private EducationType educationType;
    private String institutionName;
    private int yearStart;
    private int yearEnd;
}
