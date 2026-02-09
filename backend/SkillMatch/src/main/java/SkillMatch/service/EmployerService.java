package SkillMatch.service;


import SkillMatch.dto.EmployerDTO;
import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.model.Employer;
import SkillMatch.model.Photo;
import SkillMatch.model.User;
import SkillMatch.repository.EmployerRepo;
import SkillMatch.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmployerService {

    private final EmployerRepo repo;

    private final PhotoService photoService;

    private final PhotoRepository photoRepository;

    public List<Employer> getEmployers(){
       List<Employer>employers=repo.findAll();
       return employers;
    }

    public Employer getEmployerById(Long id){
        return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Employer not found"));
    }

    public Employer addEmployer(EmployerDTO employerDTO, MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        Photo photo = new Photo();
        if (!file.isEmpty()) {
            photo = photoService.createPhoto(file);
        }
        Employer employer = Employer.builder()
                .companyName(employerDTO.getCompanyName())
                .description(employerDTO.getDescription())
                .industry(employerDTO.getIndustry())
                .user(user)
                .pictureUrl(photo.getUrl())
                .website(employerDTO.getWebsite())
                .location(employerDTO.getLocation())
                .build();
        return repo.save(employer);
    }

    public void deleteEmployer(Long id){
       repo.deleteById(id);
    }

    public Employer UpdateEmployer(Long id, EmployerDTO employer, MultipartFile file) throws IOException {

        Employer currentData=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Employer not found"));
        Photo photo = new Photo();
        if (file != null) {
            photo = photoService.createPhoto(file);
        }
        if (photo.getUrl() != null) {
            currentData.setPictureUrl(photo.getUrl());
        }
        if (employer.getCompanyName() != null) {
            currentData.setCompanyName(employer.getCompanyName());
        }
        if (employer.getDescription() != null) {
            currentData.setDescription(employer.getDescription());
        }
        if (employer.getIndustry() != null) {
            currentData.setIndustry(employer.getIndustry());
        }
        if (employer.getWebsite() != null) {
            currentData.setWebsite(employer.getWebsite());
        }
        if (employer.getLocation() != null) {
            currentData.setLocation(employer.getLocation());
        }
        repo.save(currentData);
        return currentData;

    }

}
