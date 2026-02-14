package SkillMatch.repository;

import SkillMatch.model.ConnectionRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConnectionRecommendationRepository extends JpaRepository<ConnectionRecommendation, Long> {
    List<ConnectionRecommendation> findByUserIdOrderByRankAsc(Long userId);
}
