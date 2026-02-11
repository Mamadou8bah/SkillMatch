package SkillMatch.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_job_matches", uniqueConstraints = @UniqueConstraint(columnNames = {"candidate_id", "job_post_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateJobMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @Column(nullable = false)
    private double score;

    @Column(nullable = false)
    private LocalDateTime computedAt;
}
