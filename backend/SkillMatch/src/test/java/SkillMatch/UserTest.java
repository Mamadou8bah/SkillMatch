package SkillMatch;

import SkillMatch.model.User;
import SkillMatch.util.Role;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserProperties() {
        User user = new User();
        user.setId(1L);
        user.setFullName("Mamadou Bah");
        user.setEmail("mamadou@example.com");
        user.setPassword("securepass");
        user.setRole(Role.CANDIDATE);
        user.setActive(true);

        assertEquals(1L, user.getId());
        assertEquals("Mamadou Bah", user.getFullName());
        assertEquals("mamadou@example.com", user.getEmail());
        assertEquals("securepass", user.getPassword());
        assertEquals(Role.CANDIDATE, user.getRole());
        assertTrue(user.isActive());
        assertNotNull(user.getCreatedAt());
    }
}
