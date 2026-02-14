package SkillMatch.model;

import SkillMatch.util.LocationType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@EntityListeners(AuditingEntityListener.class)
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(unique = true)
    private String externalId;
    private String companyName;
    @Column(columnDefinition = "TEXT")
    private String companyLogo;
    @Column(columnDefinition = "TEXT")
    private String companyWebsite;
    @Column(columnDefinition = "TEXT", unique = true)
    private String jobUrl;
    private String source;
    @Column(length = 1024)
    private String industry;
    
    @ElementCollection
    @CollectionTable(name = "job_post_requirements", joinColumns = @JoinColumn(name = "job_post_id"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<String> requirements;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private Employer employer;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LocationType locationType;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Skill> requiredSkills;
    
    private String salary;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Application> applications;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UserInteraction> interactions;

    @Column(nullable = false,updatable = false)
    @CreatedDate
    private LocalDateTime postedAt;


}
