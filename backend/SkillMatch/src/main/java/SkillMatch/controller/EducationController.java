package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.dto.EducationDTO;
import SkillMatch.model.Education;
import SkillMatch.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EducationDTO>>> getEducation(){
        List<EducationDTO> educations = service.getEducation();
        return ResponseEntity.ok(ApiResponse.success("Education records retrieved successfully", educations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Education>> getEducationById(@PathVariable long id){
        Education education = service.getEducation(id);
        return ResponseEntity.ok(ApiResponse.success("Education record retrieved successfully", education));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Education>> addEducation(@Valid @RequestBody EducationDTO educationDTO) {
        Education savedEducation = service.addEducation(educationDTO);
        return ResponseEntity.ok(ApiResponse.success("Education record added successfully", savedEducation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Education>> updateEducation(@PathVariable long id, @Valid @RequestBody EducationDTO education) {
        Education updatedEducation = service.updateEducation(id, education);
        return ResponseEntity.ok(ApiResponse.success("Education record updated successfully", updatedEducation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEducation(@PathVariable long id){
        service.deleteEducation(id);
        return ResponseEntity.ok(ApiResponse.success("Education record deleted successfully"));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<?>> getUserEducation() {
        return ResponseEntity.ok(ApiResponse.success("User records retrieved successfully", service.getEducationByUser_Id()));
    }
}
