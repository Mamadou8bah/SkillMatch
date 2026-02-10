package SkillMatch.repository;

import SkillMatch.model.User;
import SkillMatch.util.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface UserRepo extends JpaRepository<User,Long> {

    User findByEmail(String email);

    List<User> findByRole(Role role);

    long countByCreatedAtAfter(LocalDateTime date);
}
