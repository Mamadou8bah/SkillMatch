package SkillMatch.repository;

import SkillMatch.model.Connection;
import SkillMatch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    List<Connection> findByRequesterAndAccepted(User requester, boolean accepted);

    List<Connection> findByTargetAndAccepted(User target, boolean accepted);

    @Query("SELECT c FROM Connection c WHERE (c.requester = :u1 AND c.target = :u2) OR (c.requester = :u2 AND c.target = :u1)")
    Optional<Connection> findConnectionBetween(User u1, User u2);

    List<Connection> findByTargetAndAcceptedFalse(User target);
}
