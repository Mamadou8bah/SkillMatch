package SkillMatch.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "connection_recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_user_id", insertable = false, updatable = false)
    private User recommendedUser;

    @Column(name = "recommended_user_id")
    private Long recommendedUserId;

    private Double score;
    private Integer rank;

    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
