package SkillMatch.repository;

import SkillMatch.model.CandidateJobMatch;
import SkillMatch.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateJobMatchRepository extends JpaRepository<CandidateJobMatch, Long> {
    List<CandidateJobMatch> findByCandidateOrderByScoreDesc(User candidate, Pageable pageable);
}
