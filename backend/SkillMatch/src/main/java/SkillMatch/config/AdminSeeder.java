package SkillMatch.config;

import SkillMatch.model.User;
import SkillMatch.repository.UserRepo;
import SkillMatch.util.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepo.findByEmail("admin@skillmatch.com") == null) {
            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@skillmatch.com");
            // Default password for seeding. User should change it after first login.
            admin.setPassword(passwordEncoder.encode("Admin123"));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            admin.setAccountVerified(true);
            admin.setRegistrationStage(4);
            userRepo.save(admin);
            System.out.println("Admin user seeded: admin@skillmatch.com / Admin123");
        }
    }
}
