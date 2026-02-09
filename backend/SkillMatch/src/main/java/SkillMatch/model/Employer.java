package SkillMatch.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Setter
@Builder
public class Employer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = false)
    private String  companyName;
    private String website;
    @Column(nullable = false)
    private String industry;
    @Column(nullable = false)
    private String location;
    @Column(nullable = false)
    private String description;

    private String pictureUrl;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    @OneToMany(mappedBy = "employer",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<JobPost>jobPosts;


}
