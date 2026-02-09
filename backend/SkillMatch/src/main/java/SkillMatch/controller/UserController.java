package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.dto.UserDTO;
import SkillMatch.model.User;
import SkillMatch.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {


    private final UserService service;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsers(){
        List<UserDTO> users = service.getUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/candidates")
    public ResponseEntity<ApiResponse<List<User>>> getCandidates() {
        List<User> candidates = service.getCandidates();
        return ResponseEntity.ok(ApiResponse.success("Candidates retrieved successfully", candidates));
    }

    @GetMapping("/network")
    public ResponseEntity<ApiResponse<List<User>>> getNetwork() {
        User user = service.getLogInUser();
        List<User> network = service.getNetwork(user);
        return ResponseEntity.ok(ApiResponse.success("Network retrieved successfully", network));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable long id){
        User user = service.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable long id) {
        service.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable long id, @Valid @RequestBody User newUser){
        User updatedUser = service.updateUser(id, newUser);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @PostMapping("/{id}/onboarding")
    public ResponseEntity<ApiResponse<User>> saveOnboarding(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> data) {
        User user = service.saveOnboardingData(id, data);
        return ResponseEntity.ok(ApiResponse.success("Onboarding data saved successfully", user));
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        User user = service.getUserById(id);
        service.uploadPhoto(file, user);
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded successfully"));
    }
}
