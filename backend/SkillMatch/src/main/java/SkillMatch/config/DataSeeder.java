package SkillMatch.config;

import SkillMatch.model.User;
import SkillMatch.repository.UserRepo;
import SkillMatch.util.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepo.count() < 10) { // Seed if database is relatively empty
            log.info("Seeding 30 Gambian users...");
            seedUsers();
            log.info("Finished seeding users.");
        }
    }

    private void seedUsers() {
        List<String> names = Arrays.asList(
            "Modou Barrow", "Fatou Jatta", "Bakary Sanneh", "Mariama Cessay", "Ebrima Njie",
            "Awa Sarr", "Lamin Camara", "Isatou Bah", "Ousman Diallo", "Haddy N'dow",
            "Mousa Faye", "Binta Bojang", "Kebba Touray", "Jainaba Sonko", "Abdoulie Joof",
            "Safiatou Colley", "Sulayman Dibba", "Kaddy Saidy", "Pa Ousman Taal", "Fatoumata Sawaneh",
            "Amadou Jaiteh", "Ramatoulie Khan", "Alhaji Cham", "Aisha Baldeh", "Mustapha Manneh",
            "Nyima Badjie", "Sheriff Keita", "Adama Mendy", "Rohey Fatma", "Bubacarr Drammeh"
        );

        List<String> professions = Arrays.asList(
            "Software Developer", "Nurse", "Teacher", "Accountant", "Marketing Specialist",
            "Electrician", "Civil Engineer", "Data Analyst", "Customer Support", "Project Manager"
        );

        List<String> locations = Arrays.asList(
            "Banjul", "Serekunda", "Brikama", "Bakau", "Farafenni",
            "Sukuta", "Gunjur", "Soma", "Lamin", "Brufut"
        );

        List<String> experienceLevels = Arrays.asList("JUNIOR", "MID", "SENIOR", "ENTRY");

        Random random = new Random();
        String defaultPassword = passwordEncoder.encode("Password123!");

        for (int i = 0; i < names.size(); i++) {
            String name = names.get(i);
            String email = name.toLowerCase().replace(" ", ".") + i + "@example.com";
            
            if (userRepo.findByEmail(email) == null) {
                User user = new User();
                user.setFullName(name);
                user.setEmail(email);
                user.setPassword(defaultPassword);
                user.setProfession(professions.get(random.nextInt(professions.size())));
                user.setLocation(locations.get(random.nextInt(locations.size())) + ", The Gambia");
                user.setExperienceLevel(experienceLevels.get(random.nextInt(experienceLevels.size())));
                user.setRole(Role.CANDIDATE);
                user.setActive(true);
                user.setAccountVerified(true);
                user.setRegistrationStage(5); 
                
                userRepo.save(user);
            }
        }
    }
}
