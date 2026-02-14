package SkillMatch.service;

import SkillMatch.dto.ExperienceDTO;
import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.model.Experience;
import SkillMatch.model.User;
import SkillMatch.repository.ExperienceRepo;
import SkillMatch.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepo repo;
    private final UserRepo userRepository;

    public List<ExperienceDTO> getUserExperiences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Experience> experienceList = repo.findByUser(user);
        List<ExperienceDTO> experienceDTOS = new ArrayList<>();
        for (Experience experience : experienceList) {
            experienceDTOS.add(new ExperienceDTO(experience.getCompanyName(), experience.getJobTitle(), experience.getStartDate(), experience.getEndDate(), experience.getDescription()));
        }
        return experienceDTOS;
    }

    public List<ExperienceDTO> getExperiences(){
        List<Experience>experienceList=repo.findAll();

        List<ExperienceDTO>experienceDTOS=new ArrayList<>();

        for (Experience experience:experienceList){
            experienceDTOS.add(new ExperienceDTO(experience.getCompanyName(), experience.getJobTitle(), experience.getStartDate(), experience.getEndDate(), experience.getDescription()));
        }
        return experienceDTOS;
    }

    public Experience addExperience(ExperienceDTO experienceDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        Experience experience = Experience.builder()
                .description(experienceDTO.getDescription())
                .startDate(experienceDTO.getStartDate())
                .endDate(experienceDTO.getEndDate())
                .companyName(experienceDTO.getCompanyName())
                .jobTitle(experienceDTO.getJobTitle())
                .user(user)
                .build();
        return repo.save(experience);
    }

    public Experience getExperienceById(long id){
        return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Experience not found"));
    }   
    public Experience deleteExperience(long id){
        Experience experience=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Experience not found"));
        repo.deleteById(id);
        return experience;
    }

    public Experience updateExperience(long id, ExperienceDTO newExperience) {
        Experience experience=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Experience not found"));
        if (newExperience.getDescription() != null) {
            experience.setDescription(newExperience.getDescription());
        }
        if (newExperience.getEndDate() != null) {
            experience.setEndDate(newExperience.getEndDate());
        }
        if (newExperience.getStartDate() != null) {
            experience.setStartDate(newExperience.getStartDate());
        }
        if (newExperience.getCompanyName() != null) {
            experience.setCompanyName(newExperience.getCompanyName());
        }
        if (newExperience.getJobTitle() != null) {
            experience.setJobTitle(newExperience.getJobTitle());
        }
        return repo.save(experience);
    }
}
