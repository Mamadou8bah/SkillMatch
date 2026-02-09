package SkillMatch.service;

import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.model.User;
import SkillMatch.repository.UserRepo;
import SkillMatch.util.Role;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void testGetUserById_Success() {
        // Arrange
        Long userId = 1L;
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setFullName("Test User");
        mockUser.setEmail("test@example.com");
        mockUser.setRole(Role.CANDIDATE);

        when(userRepo.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.getUserById(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("Test User", result.getFullName());
        assertEquals("test@example.com", result.getEmail());
        verify(userRepo, times(1)).findById(userId);
    }

    @Test
    void testGetUserById_NotFound() {
        // Arrange
        Long userId = 999L;
        when(userRepo.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserById(userId);
        });
        verify(userRepo, times(1)).findById(userId);
    }

    @Test
    void testUpdateUser_Success() {
        // Arrange
        Long userId = 1L;
        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setFullName("Old Name");
        existingUser.setEmail("old@example.com");

        User newUserData = new User();
        newUserData.setFullName("New Name");
        newUserData.setEmail("new@example.com");
        newUserData.setLocation("New Location");

        when(userRepo.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepo.save(any(User.class))).thenAnswer(invocation -> {
            User userToSave = invocation.getArgument(0);
            return userToSave;
        });

        // Act
        User result = userService.updateUser(userId, newUserData);

        // Assert
        assertNotNull(result);
        assertEquals("New Name", result.getFullName());
        assertEquals("new@example.com", result.getEmail());
        assertEquals("New Location", result.getLocation());
        verify(userRepo, times(1)).findById(userId);
        verify(userRepo, times(1)).save(existingUser);
    }
}
