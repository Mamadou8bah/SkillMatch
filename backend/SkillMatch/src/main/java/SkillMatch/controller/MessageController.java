package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.model.Message;
import SkillMatch.model.User;
import SkillMatch.service.MessageService;
import SkillMatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;
    private final UserService userService;

    public record MessageRequest(Long recipientId, String content) {
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Message>> sendMessage(@RequestBody MessageRequest request) {
        User user = userService.getLogInUser();
        Message message = messageService.sendMessage(user, request.recipientId(), request.content());
        return ResponseEntity.ok(ApiResponse.success("Message sent", message));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<ApiResponse<List<Message>>> getConversation(@PathVariable Long otherUserId) {
        User user = userService.getLogInUser();
        return ResponseEntity.ok(ApiResponse.success("Conversation retrieved", messageService.getConversation(user, otherUserId)));
    }

    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<List<Message>>> getInbox() {
        User user = userService.getLogInUser();
        return ResponseEntity.ok(ApiResponse.success("Inbox retrieved", messageService.getRecentConversations(user)));
    }
}
