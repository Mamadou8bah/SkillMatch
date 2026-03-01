package SkillMatch.repository;

import SkillMatch.model.AuthIdentity;
import SkillMatch.util.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthIdentityRepository extends JpaRepository<AuthIdentity, Long> {
    Optional<AuthIdentity> findByAuthProviderAndSubject(AuthProvider authProvider, String subject);
    Optional<AuthIdentity> findByUserIdAndAuthProvider(long userId, AuthProvider authProvider);
    boolean existsByAuthProviderAndSubject(AuthProvider authProvider, String subject);
}
