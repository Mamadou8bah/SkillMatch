package SkillMatch.repository;

import SkillMatch.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application,Long> {

    Optional<Application> findByUser_IdAndJobPost_Id(Long candidateId, Long jobId);

    List<Application> findApplicationsByJobPost_Id(Long jobId);

    List<Application> findApplicationsByUser_Id(Long candidateId);

}
