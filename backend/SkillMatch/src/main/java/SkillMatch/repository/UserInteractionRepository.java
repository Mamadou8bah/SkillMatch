package SkillMatch.repository;

import SkillMatch.model.JobPost;
import SkillMatch.model.User;
import SkillMatch.model.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    List<UserInteraction> findByUser(User user);

    List<UserInteraction> findByUserAndJobPost(User user, JobPost jobPost);

    long countByUserAndJobPostAndInteractionType(User user, JobPost jobPost, String interactionType);
}
