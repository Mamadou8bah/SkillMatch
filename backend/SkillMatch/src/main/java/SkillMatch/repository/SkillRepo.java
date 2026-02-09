package SkillMatch.repository;

import SkillMatch.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import SkillMatch.model.User;

import java.util.List;

@Repository
public interface SkillRepo extends JpaRepository<Skill,Long> {
    List<Skill> findByUser(User user);
}
