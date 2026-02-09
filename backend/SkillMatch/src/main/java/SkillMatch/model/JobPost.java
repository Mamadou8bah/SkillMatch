package SkillMatch.model;

import SkillMatch.util.LocationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, length = 10000)
    private String description;
    
    private String externalId;
    private String companyName;
    private String companyLogo;
    private String jobUrl;
    private String source;
    private String industry;
    private String jobType;
    
    @ElementCollection
    private List<String> requirements;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private Employer employer;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LocationType locationType;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> requiredSkills;
    
    private String salary;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL)
    private Set<Application> applications;

    @Column(nullable = false,updatable = false)
    @CreatedDate
    private LocalDateTime postedAt;


}
