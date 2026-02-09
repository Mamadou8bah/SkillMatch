package SkillMatch.dto;
import SkillMatch.model.Skill;
import lombok.*;

import java.util.List;


public record CandidateDTO(
         String name,
         String location,
         List<Skill>skills
) {



}
