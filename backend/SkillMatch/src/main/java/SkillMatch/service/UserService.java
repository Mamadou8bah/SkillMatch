package SkillMatch.service;

import SkillMatch.dto.LoginRequest;
import SkillMatch.dto.LoginResponse;
import SkillMatch.dto.PasswordResetDTO;
import SkillMatch.dto.RegisterRequest;
import SkillMatch.dto.RegistrationStage1Request;
import SkillMatch.dto.RegistrationStage2Request;
import SkillMatch.dto.RegistrationStage3Request;
import SkillMatch.dto.UserDTO;
import SkillMatch.exception.UserAlreadyExistException;
import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.exception.InvalidCredentialsException;
import SkillMatch.exception.AuthenticationException;
import SkillMatch.exception.ValidationException;
import SkillMatch.exception.TokenExpiredException;
import SkillMatch.exception.InvalidResetTokenException;
import SkillMatch.exception.PasswordMismatchException;
import SkillMatch.model.*;
import SkillMatch.repository.EmployerRepo;
import SkillMatch.repository.PhotoRepository;
import SkillMatch.repository.TokenRepo;
import SkillMatch.repository.UserRepo;
import SkillMatch.util.AccountVerificationEmailContext;
import SkillMatch.util.PasswordResetEmailContext;
import SkillMatch.util.PasswordResetConfirmationEmailContext;
import SkillMatch.util.JwtUtil;
import SkillMatch.util.Role;
import SkillMatch.validator.ObjectValidator;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepo repo;


    private final EmployerRepo employerRepo;


    private final EmailService emailService;

    private final BCryptPasswordEncoder encoder;


    private final JwtUtil jwtUtil;


    private final SecureTokenService secureTokenService;

    private final TokenRepo tokenRepo;

    @Value("${site.base.url}")
    private String baseUrl;


    private final PhotoService photoService;


    private final PhotoRepository photoRepository;


    public long countUsers() {
        return repo.count();
    }

    public long countRecentUsers(int days) {
        return repo.countByCreatedAtAfter(LocalDateTime.now().minusDays(days));
    }

    public List<UserDTO>getUsers(){
        return repo.findAll(org.springframework.data.domain.PageRequest.of(0, 50))
                .getContent()
                .stream()
                .map(user -> new UserDTO(user.getId(), user.getFullName(), user.getEmail(), user.getRole().toString()))
                .toList();
    }

    public List<User> getCandidates() {
        return repo.findByRole(Role.CANDIDATE);
    }

    public List<User> getNetwork(User currentUser) {
        return repo.findAll().stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .toList();
    }

    public User getUserById(long id){
        return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("User not found"));
    }
    public User deleteUser(long id){
        User user= repo.findById(id).orElseThrow(()->new ResourceNotFoundException("User not found"));
        repo.delete(user);
        return user;
    }

    public User updateUser(long id,User newUser){
        User user=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("User not found"));

        user.setEmail(newUser.getEmail());
        user.setFullName(newUser.getFullName());
        user.setPassword(newUser.getPassword());
        user.setLocation(newUser.getLocation());

        repo.save(user);
        return  user;
    }

    @Transactional
    public User register(RegisterRequest request) throws UserAlreadyExistException, ConstraintViolationException {
        if (request == null) {
            throw new ValidationException("Registration request cannot be null");
        }
        String email = request.email().trim().toLowerCase();
        if (email.isEmpty()) {
            throw new ValidationException("Email cannot be empty");
        }
        User existingUser = repo.findByEmail(email);

        if (existingUser != null) {
            sendRegistrationConfirmationEmail(existingUser);
            throw new UserAlreadyExistException("User Already Exist, Please Verify your Email if you have not done sure");
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));
        user.setLocation(request.location());
        user.setRole(request.isEmployer() ? Role.EMPLOYER : Role.CANDIDATE);
        user.setActive(true);
        user.setAccountVerified(false);
        User saveUser=repo.save(user);

        if (request.isEmployer()) {
            Employer employer = new Employer();
            employer.setCompanyName(request.companyName());
            employer.setIndustry(request.industry());
            employer.setDescription(request.description());
            employer.setLocation(request.location());
            employer.setUser(saveUser);
            employerRepo.save(employer);
        }

        try {
            sendRegistrationConfirmationEmail(saveUser);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
        return saveUser;
    }

    @Transactional
    public User registerStage1(RegistrationStage1Request request) throws UserAlreadyExistException {
        User existingUser = repo.findByEmail(request.email().trim().toLowerCase());
        if (existingUser != null) {
            throw new UserAlreadyExistException("User with this email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(encoder.encode(request.password()));
        user.setRole(Role.CANDIDATE); // Default role
        user.setActive(true);
        user.setAccountVerified(false);
        user.setRegistrationStage(1);

        User savedUser = repo.save(user);
        try {
            sendRegistrationConfirmationEmail(savedUser);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email in Stage 1: " + e.getMessage());
            // We still return the user so registration can proceed
        }
        return savedUser;
    }

    @Transactional
    public User registerStage2(Long userId, RegistrationStage2Request request) {
        User user = repo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (request.location() != null) user.setLocation(request.location());
        if (request.role() != null) user.setRole(request.role());
        if (request.profession() != null) user.setProfession(request.profession());
        
        if (request.photo() != null && !request.photo().isEmpty()) {
            try {
                if (user.getPhoto() != null) {
                    photoService.deletePhoto(user.getPhoto());
                }
                Photo photo = photoService.createPhotoFromBase64(request.photo());
                photo.setUser(user);
                user.setPhoto(photo);
            } catch (IOException e) {
                // Log error but permit progress
            }
        }
        
        user.setRegistrationStage(2);
        return repo.save(user);
    }

    @Transactional
    public User registerStage3(Long userId, RegistrationStage3Request request) {
        User user = repo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.EMPLOYER) {
            Employer employer = new Employer();
            employer.setCompanyName(request.companyName());
            employer.setIndustry(request.industry());
            employer.setDescription(request.description());
            employer.setLocation(user.getLocation());
            employer.setUser(user);
            employerRepo.save(employer);
        }

        if (request.skills() != null && !request.skills().isEmpty()) {
            user.getSkills().clear();
            List<Skill> skills = request.skills().stream().map(title -> {
                Skill s = new Skill();
                s.setTitle(title);
                s.setUser(user);
                return s;
            }).toList();
            user.getSkills().addAll(skills);
        }

        user.setRegistrationStage(3);
        return repo.save(user);
    }

    @Transactional
    public User saveOnboardingData(Long userId, java.util.Map<String, Object> data) {
        User user = repo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update basic info
        if (data.containsKey("location")) {
            user.setLocation((String) data.get("location"));
        }

        if (data.containsKey("profession")) {
            user.setProfession((String) data.get("profession"));
        }

        if (data.containsKey("experience")) {
            user.setExperienceLevel((String) data.get("experience"));
        }

        // Handle Photo
        if (data.containsKey("photo") && data.get("photo") != null && !((String) data.get("photo")).isEmpty()) {
            String base64Photo = (String) data.get("photo");
            try {
                if (user.getPhoto() != null) {
                    photoService.deletePhoto(user.getPhoto());
                }
                Photo photo = photoService.createPhotoFromBase64(base64Photo);
                photo.setUser(user);
                user.setPhoto(photo);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload profile photo", e);
            }
        }

        // Update role if changed
        if (data.containsKey("role")) {
            user.setRole(Role.valueOf((String) data.get("role")));
        }

        // Handle Skills
        if (data.containsKey("skills")) {
            List<String> skillTitles = (List<String>) data.get("skills");
            user.getSkills().clear();
            List<Skill> skills = skillTitles.stream().map(title -> {
                Skill s = new Skill();
                s.setTitle(title);
                s.setUser(user);
                return s;
            }).toList();
            user.getSkills().addAll(skills);
        }

        user.setRegistrationStage(4);

        return repo.save(user);
    }

    public LoginResponse login(LoginRequest request){
        User user=repo.findByEmail(request.getEmail());
        if(user==null) throw new ResourceNotFoundException("No user with that email");

        if(!user.isAccountVerified()) {
            throw new AuthenticationException("Please verify your email before logging in");
        }

        if(!encoder.matches(request.getPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Invalid credentials");
        }
        String jwtToken=jwtUtil.generateToken(user.getEmail());
        Token token=new Token();
        token.setToken(jwtToken);
        token.setRevoked(false);
        token.setExpired(false);
        token.setUser(user);
        tokenRepo.save(token);
        return new LoginResponse(jwtToken, user.getId(), user.getRole().name(), user.getRegistrationStage());
    }
    public User getLogInUser(){
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();

        if(authentication==null||!authentication.isAuthenticated()){
            throw new AuthenticationException("Not authenticated");
        }
        String email=authentication.getName();

        User user=repo.findByEmail(email);

        return user;
    }

    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        String jwt = authHeader.substring(7);
        Token token=tokenRepo.findByToken(jwt);
        if(token!= null) {
            token.setExpired(true);
            token.setRevoked(true);
            tokenRepo.save(token);
        }
    }

    public void resendRegistrationCode(String email) {
        User user = repo.findByEmail(email);
        if (user != null && !user.isAccountVerified()) {
            sendRegistrationConfirmationEmail(user);
        }
    }

    @Async
    public void sendRegistrationConfirmationEmail(User user){

        List<SecureToken> secureTokens = user.getSecureTokens();
        for (SecureToken oldToken : secureTokens) {
            oldToken.setExpiredAt(LocalDateTime.now());
            secureTokenService.saveToken(oldToken);
        }
        SecureToken secureToken=secureTokenService.create6DigitCode();
        secureToken.setUser(user);
        secureTokenService.saveToken(secureToken);

        AccountVerificationEmailContext context=new AccountVerificationEmailContext();
        context.init(user);
        context.setToken(secureToken.getToken());
        context.buildVerificationUrl(baseUrl,secureToken.getToken());
        emailService.sendMail(context);
    }

    public boolean verifyAccount(String token) {
        SecureToken secureToken = secureTokenService.findByToken(token);
        if (secureToken == null || secureToken.getExpiredAt().isBefore(java.time.LocalDateTime.now())) {
            return false;
        }
        
        User user = secureToken.getUser();
        user.setAccountVerified(true);
        repo.save(user);
        secureTokenService.removeToken(secureToken);
        return true;
    }

    public void requestPasswordReset(String email) {
        User user = repo.findByEmail(email);
        if (user == null) {
            return;
        }

        SecureToken resetToken = secureTokenService.create6DigitCode();
        resetToken.setUser(user);
        secureTokenService.saveToken(resetToken);

        try {
            sendPasswordResetEmail(user, resetToken.getToken());
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }
    }

    public boolean validateResetToken(String token) {
        SecureToken secureToken = secureTokenService.findByToken(token);
        return secureToken != null && secureToken.getExpiredAt().isAfter(java.time.LocalDateTime.now());
    }

    public void resetPassword(PasswordResetDTO resetDTO) {
        if (!resetDTO.getNewPassword().equals(resetDTO.getConfirmPassword())) {
            throw new PasswordMismatchException("Passwords do not match");
        }

        SecureToken secureToken = secureTokenService.findByToken(resetDTO.getToken());
        if (secureToken == null) {
            throw new InvalidResetTokenException("Invalid reset token");
        }

        if (secureToken.getExpiredAt().isBefore(java.time.LocalDateTime.now())) {
            throw new TokenExpiredException("Reset token has expired");
        }

        User user = secureToken.getUser();
        user.setPassword(encoder.encode(resetDTO.getNewPassword()));
        repo.save(user);

        secureTokenService.removeToken(secureToken);

        try {
            sendPasswordResetConfirmationEmail(user);
        } catch (Exception e) {
            System.err.println("Failed to send password reset confirmation email: " + e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(User user, String token) {
        PasswordResetEmailContext context = new PasswordResetEmailContext();
        context.init(user);
        context.setToken(token);
        context.buildResetUrl(baseUrl, token);
        emailService.sendMail(context);
    }

    @Async
    public void sendPasswordResetConfirmationEmail(User user) {
        PasswordResetConfirmationEmailContext context = new PasswordResetConfirmationEmailContext();
        context.init(user);
        emailService.sendMail(context);
    }


    public ResponseEntity<?> uploadPhoto(MultipartFile file, User user) throws IOException {
        try {
            if (user.getPhoto() != null) {
                photoService.deletePhoto(user.getPhoto());
            }
            Photo photo = photoService.createPhoto(file);
            photo.setUser(user);
            photoRepository.save(photo);
            return ResponseEntity.ok().body("Image uploaded successfully");

        } catch (IOException e) {
            throw new IOException("Could not upload photo: " + e.getMessage());
        }
    }
    public ResponseEntity<?>deletePhoto(Photo photo)throws IOException{
        photoService.deletePhoto(photo);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?>changeProfilePhoto(Photo photo,MultipartFile newPhoto)throws IOException{
        photoService.updatePhoto(photo.getUrl(),newPhoto);
        return ResponseEntity.ok().build();
    }

}
