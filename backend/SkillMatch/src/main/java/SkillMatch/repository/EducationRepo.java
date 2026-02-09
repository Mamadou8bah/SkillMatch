package SkillMatch.repository;

import SkillMatch.model.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepo extends JpaRepository<Education,Long> {
    List<Education> getEducationByUser_Id(long id);
}
