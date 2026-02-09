package SkillMatch.service;

import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.model.Message;
import SkillMatch.model.User;
import SkillMatch.repository.MessageRepository;
import SkillMatch.repository.UserRepo;
import SkillMatch.util.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ConnectionService connectionService;
    private final UserRepo userRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public Message sendMessage(User sender, Long recipientId, String content) {
        User recipient = userRepo.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        boolean canSend = false;

        // 1. Employers can DM any Candidate (employee)
        if (sender.getRole() == Role.EMPLOYER && recipient.getRole() == Role.CANDIDATE) {
            canSend = true;
        }
        // 2. Connected users can message each other
        else if (connectionService.areConnected(sender, recipient)) {
            canSend = true;
        }
        // 3. Candidates can reply to Employers who have messaged them (or if connected)
        else if (sender.getRole() == Role.CANDIDATE && recipient.getRole() == Role.EMPLOYER) {
            // Check if there is already a conversation started by the employer
            List<Message> history = messageRepository.findConversation(sender, recipient);
            if (!history.isEmpty()) {
                canSend = true;
            }
        }

        if (!canSend) {
            throw new RuntimeException("You are not authorized to message this user. You must be connected first.");
        }

        Message message = Message.builder()
                .sender(sender)
                .recipient(recipient)
                .content(content)
                .build();

        Message savedMessage = messageRepository.save(message);

        // Notify the recipient in real-time
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/messages",
                savedMessage
        );

        return savedMessage;
    }

    public List<Message> getConversation(User u1, Long u2Id) {
        User u2 = userRepo.findById(u2Id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.findConversation(u1, u2);
    }

    public List<Message> getRecentConversations(User user) {
        return messageRepository.findRecentConversations(user);
    }
}
