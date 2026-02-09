package SkillMatch.repository;

import SkillMatch.model.Message;
import SkillMatch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender = :u1 AND m.recipient = :u2) OR (m.sender = :u2 AND m.recipient = :u1) ORDER BY m.sentAt ASC")
    List<Message> findConversation(User u1, User u2);

    @Query("SELECT m FROM Message m WHERE m.id IN (SELECT MAX(m2.id) FROM Message m2 WHERE m2.sender = :user OR m2.recipient = :user GROUP BY CASE WHEN m2.sender = :user THEN m2.recipient ELSE m2.sender END) ORDER BY m.sentAt DESC")
    List<Message> findRecentConversations(User user);

    List<Message> findByRecipientAndIsReadFalse(User recipient);
}
