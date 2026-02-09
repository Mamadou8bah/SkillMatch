package SkillMatch.repository;

import SkillMatch.model.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import SkillMatch.model.User;

import java.util.List;

@Repository
public interface ExperienceRepo extends JpaRepository<Experience,Long> {
    List<Experience> findByUser(User user);
}
