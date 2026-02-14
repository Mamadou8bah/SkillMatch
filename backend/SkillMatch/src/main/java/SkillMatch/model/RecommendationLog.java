package SkillMatch.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_type")
    private String itemType; // 'JOB' or 'CONNECTION'

    @Column(name = "event_type")
    private String eventType; // 'SHOWN', 'CLICKED', 'APPLIED', 'CONNECTED'

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
