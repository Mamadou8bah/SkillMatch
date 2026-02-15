package SkillMatch.repository;

import SkillMatch.model.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostRepo extends JpaRepository<JobPost,Long> {
    List<JobPost> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT DISTINCT j FROM JobPost j " +
           "LEFT JOIN j.requiredSkills s " +
           "LEFT JOIN j.employer e " +
           "WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(j.industry) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<JobPost> searchJobs(@Param("query") String query);

    List<JobPost> findByEmployerId(Long employerId);

    boolean existsByExternalId(String externalId);

    boolean existsByJobUrl(String jobUrl);

    long countByPostedAtAfter(java.time.LocalDateTime date);

    void deleteByPostedAtBefore(java.time.LocalDateTime dateTime);
}
