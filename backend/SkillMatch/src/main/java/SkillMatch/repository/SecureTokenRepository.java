package SkillMatch.repository;

import SkillMatch.model.SecureToken;
import SkillMatch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SecureTokenRepository extends JpaRepository<SecureToken,Long> {

    SecureToken findByToken(String token);
    Long removeByToken(String string);
    
    @Modifying
    @Query("DELETE FROM SecureToken s WHERE s.user = :user")
    void deleteByUser(User user);
}
