package SkillMatch.service;

import SkillMatch.dto.EducationDTO;
import SkillMatch.exception.AuthenticationException;
import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.model.Education;
import SkillMatch.model.User;
import SkillMatch.repository.EducationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EducationService {


    private  final EducationRepo repo;
    public List<EducationDTO>getEducation(){
        List<Education>educations=repo.findAll();
        List<EducationDTO>educationDTOList=new ArrayList<>();

        for(Education education:educations){
            educationDTOList.add(new EducationDTO(education.getDegree(), education.getEducationType(), education.getInstitutionName(), education.getYearCompleted(), education.getYearStarted()));
        }
        return educationDTOList;
    }

    public Education getEducation(long id){
        return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Education not found"));
    }

    public Education addEducation(EducationDTO educationDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new AuthenticationException("Not logged in");
        }
        Education education = Education.builder().
                user(user)
                .educationType(educationDTO.getEducationType())
                .degree(educationDTO.getDegree())
                .institutionName(educationDTO.getInstitutionName())
                .yearStarted(educationDTO.getYearStart())
                .yearCompleted(educationDTO.getYearEnd())
                .build();
        return repo.save(education);
    }

    public Education updateEducation(long id, EducationDTO education) {
        Education education1=repo.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Education not found"));
        if (education.getDegree() != null) {
            education1.setDegree(education.getDegree());
        }
        if (education.getEducationType() != null) {
            education1.setEducationType(education.getEducationType());
        }
        if (education.getInstitutionName() != null) {
            education1.setInstitutionName(education.getInstitutionName());
        }
        if (education.getYearEnd() != 0) {
            education1.setYearCompleted(education.getYearEnd());
        }
        if (education.getYearStart() != 0) {
            education1.setYearStarted(education.getYearStart());
        }
        return repo.save(education1);
    }

    public Education deleteEducation(long id){
       Education education=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Education not found"));
       repo.delete(education);
       return education;
    }

    public List<EducationDTO> getEducationByUser_Id() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new AuthenticationException("Not logged in");
        }

        List<Education> educations = repo.getEducationByUser_Id(user.getId());
        List<EducationDTO> educationDTOList = new ArrayList<>();
        for (Education education1 : educations) {
            EducationDTO education = new EducationDTO();
            education.setDegree(education1.getDegree());
            education.setEducationType(education1.getEducationType());
            education.setInstitutionName(education1.getInstitutionName());
            education.setYearStart(education1.getYearStarted());
            education.setYearEnd(education1.getYearCompleted());
            educationDTOList.add(education);
        }
        return educationDTOList;
    }
}
