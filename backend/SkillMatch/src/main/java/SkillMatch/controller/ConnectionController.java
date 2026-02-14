package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.model.Connection;
import SkillMatch.model.User;
import SkillMatch.service.ConnectionService;
import SkillMatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {
    private final ConnectionService connectionService;
    private final UserService userService;

    @PostMapping("/request/{targetId}")
    public ResponseEntity<ApiResponse<String>> sendRequest(@PathVariable Long targetId) {
        User user = userService.getLogInUser();
        connectionService.sendConnectionRequest(user, targetId);
        return ResponseEntity.ok(ApiResponse.success("Connection request sent"));
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<ApiResponse<String>> acceptRequest(@PathVariable Long requestId) {
        User user = userService.getLogInUser();
        connectionService.acceptConnectionRequest(user, requestId);
        return ResponseEntity.ok(ApiResponse.success("Connection request accepted"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getConnections() {
        User user = userService.getLogInUser();
        return ResponseEntity.ok(ApiResponse.success("Connections retrieved", connectionService.getConnections(user)));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Connection>>> getPendingRequests() {
        User user = userService.getLogInUser();
        return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved", connectionService.getPendingRequests(user)));
    }

    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<List<Connection>>> getSentRequests() {
        User user = userService.getLogInUser();
        return ResponseEntity.ok(ApiResponse.success("Sent requests retrieved", connectionService.getSentRequests(user)));
    }
}
