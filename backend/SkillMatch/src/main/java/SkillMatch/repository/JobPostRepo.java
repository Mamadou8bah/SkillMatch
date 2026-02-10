package SkillMatch.repository;

import SkillMatch.model.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostRepo extends JpaRepository<JobPost,Long> {
    List<JobPost> findByTitleContainingIgnoreCase(String title);

    List<JobPost> findByEmployerId(Long employerId);

    boolean existsByExternalId(String externalId);

    boolean existsByJobUrl(String jobUrl);

    void deleteByPostedAtBefore(java.time.LocalDateTime dateTime);
}
