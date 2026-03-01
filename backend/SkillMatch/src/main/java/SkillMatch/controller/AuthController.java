package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.dto.LoginRequest;
import SkillMatch.dto.LoginResponse;
import SkillMatch.dto.PasswordResetRequestDTO;
import SkillMatch.dto.PasswordResetDTO;
import SkillMatch.dto.RegisterRequest;
import SkillMatch.dto.RegistrationStage1Request;
import SkillMatch.dto.RegistrationStage2Request;
import SkillMatch.dto.RegistrationStage3Request;
import SkillMatch.exception.UserAlreadyExistException;
import SkillMatch.model.User;
import SkillMatch.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


    private final UserService service;

    @Transactional
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request)throws UserAlreadyExistException {
        User registeredUser = service.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully. Please check your email for verification.", registeredUser));
    }

    @PostMapping("/register/stage1")
    public ResponseEntity<ApiResponse<User>> registerStage1(@Valid @RequestBody RegistrationStage1Request request) throws UserAlreadyExistException {
        User user = service.registerStage1(request);
        return ResponseEntity.ok(ApiResponse.success("Stage 1 completed. Please provide your location and role.", user));
    }

    @PostMapping("/register/stage2/{userId}")
    public ResponseEntity<ApiResponse<User>> registerStage2(@PathVariable Long userId, @Valid @RequestBody RegistrationStage2Request request) {
        User user = service.registerStage2(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Stage 2 completed.", user));
    }

    @PostMapping("/register/stage3/{userId}")
    public ResponseEntity<ApiResponse<User>> registerStage3(@PathVariable Long userId, @Valid @RequestBody RegistrationStage3Request request) {
        User user = service.registerStage3(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Registration completed. Please verify your email.", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request){
        LoginResponse response = service.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/google/login")
    public ResponseEntity<ApiResponse<LoginResponse>> googleLogin(@RequestBody java.util.Map<String, String> request) throws UserAlreadyExistException {
        String code = request.get("code");
        LoginResponse response = service.googleLoginOrRegister(code);
        return ResponseEntity.ok(ApiResponse.success("Google login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(){
        User user = service.getLogInUser();
        return ResponseEntity.ok(ApiResponse.success("Current user retrieved successfully", user));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        service.logout(request.getHeader("Authorization"));
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/register/verify")
    public ResponseEntity<ApiResponse<String>> verifyAccount(@RequestParam String token) {
        try {
            boolean isVerified = service.verifyAccount(token);
            if (isVerified) {
                return ResponseEntity.ok(ApiResponse.success("Account verified successfully! You can now log in."));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired verification code."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register/resend-code")
    public ResponseEntity<ApiResponse<String>> resendCode(@RequestParam String email) {
        service.resendRegistrationCode(email);
        return ResponseEntity.ok(ApiResponse.success("A new verification code has been sent to your email."));
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<ApiResponse<String>> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDTO request) {
        service.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("If your email is registered, you will receive password reset instructions"));
    }

    @GetMapping("/password-reset/validate/{token}")
    public ResponseEntity<ApiResponse<String>> validateResetToken(@PathVariable String token) {
        boolean isValid = service.validateResetToken(token);
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("Reset token is valid"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Reset token is invalid or expired"));
        }
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<ApiResponse<String>> confirmPasswordReset(@Valid @RequestBody PasswordResetDTO request) {
        service.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully"));
    }


}
