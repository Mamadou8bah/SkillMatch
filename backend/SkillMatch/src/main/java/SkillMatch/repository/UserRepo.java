package SkillMatch.repository;

import SkillMatch.model.User;
import SkillMatch.util.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface UserRepo extends JpaRepository<User,Long> {

    User findByEmail(String email);

    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u " +
            "WHERE u.role = :role " +
            "AND u.accountVerified = true " +
            "AND u.isActive = true " +
            "AND u.emailNotificationsEnabled = true " +
            "AND u.industry IS NOT NULL " +
            "AND LOWER(TRIM(u.industry)) = LOWER(TRIM(:industry))")
    List<User> findNotifiableUsersByRoleAndIndustry(@Param("role") Role role, @Param("industry") String industry);

    long countByCreatedAtAfter(LocalDateTime date);
}
