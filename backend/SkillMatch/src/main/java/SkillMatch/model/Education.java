package SkillMatch.model;

import SkillMatch.util.EducationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "education")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String institutionName;
    private String degree;
    private int yearStarted;
    private int yearCompleted;
    @Enumerated(EnumType.STRING)
    private EducationType educationType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


}
