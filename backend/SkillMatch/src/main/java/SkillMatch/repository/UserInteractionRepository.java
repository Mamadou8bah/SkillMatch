package SkillMatch.repository;

import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.model.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    List<UserInteraction> findByUser(User user);

    List<UserInteraction> findByUserAndJobPost(User user, JobPost jobPost);

    long countByUserAndJobPostAndInteractionType(User user, JobPost jobPost, String interactionType);

    @Query("SELECT ui.jobPost.id, COUNT(ui) " +
            "FROM UserInteraction ui " +
            "WHERE ui.interactionType = 'CLICK' " +
            "GROUP BY ui.jobPost.id " +
            "ORDER BY COUNT(ui) DESC")
    List<Object[]> findTopClickedJobIds(Pageable pageable);
}
