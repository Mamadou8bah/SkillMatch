package SkillMatch.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private JobPost job;

    @Column(name = "job_id")
    private Long jobId;

    private Double score;
    private Integer rank;

    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
