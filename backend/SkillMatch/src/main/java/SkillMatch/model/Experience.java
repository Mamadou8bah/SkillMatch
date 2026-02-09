package SkillMatch.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    @NotBlank(message = "Company name is required")
    @Column(nullable = false)
    private String companyName;
    
    @NotBlank(message = "Job title is required")
    @Column(nullable = false)
    private String jobTitle;
    
    private String description;
    
    @NotNull(message = "Start date is required")
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = true)
    private LocalDate endDate;
    
   @ManyToOne
   @JoinColumn(name = "user_id")
   private User user;


}
