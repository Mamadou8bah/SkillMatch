package SkillMatch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobicyJobDTO {
    private String id;
    private String url;
    private String jobTitle;
    private String companyName;
    private String jobDescription;
    private String jobGeo;
    private String pubDate; // Usually "yyyy-MM-dd HH:mm:ss"
    private String salary;
}
