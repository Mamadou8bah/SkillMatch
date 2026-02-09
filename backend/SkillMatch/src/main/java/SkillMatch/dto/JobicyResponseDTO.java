package SkillMatch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobicyResponseDTO {
    private boolean success;
    private int jobCount;
    private List<JobicyJobDTO> jobs;
}
