package SkillMatch.controller;

import SkillMatch.dto.ApiResponse;
import SkillMatch.dto.SkillDTO;
import SkillMatch.model.Skill;
import SkillMatch.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill")
@RequiredArgsConstructor
public class SkillController {


    private final SkillService service;

    @PostMapping
    public ResponseEntity<ApiResponse<Skill>> addSkill(@Valid @RequestBody Skill skill){
        Skill savedSkill = service.addSkill(skill);
        return ResponseEntity.ok(ApiResponse.success("Skill added successfully", savedSkill));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillDTO>>> getSkills(){
        List<SkillDTO> skills = service.getSkills();
        return ResponseEntity.ok(ApiResponse.success("Skills retrieved successfully", skills));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SkillDTO>>> getUserSkills(@PathVariable Long userId) {
        List<SkillDTO> skills = service.getUserSkills(userId);
        return ResponseEntity.ok(ApiResponse.success("User skills retrieved successfully", skills));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Skill>> getSkillById(@PathVariable long id){
        Skill skill = service.getSkillById(id);
        return ResponseEntity.ok(ApiResponse.success("Skill retrieved successfully", skill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSkill(@PathVariable long id){
        service.deleteSkill(id);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Skill>> updateSkill(@PathVariable long id, @Valid @RequestBody Skill skill){
        Skill updatedSkill = service.updateSkill(id, skill);
        return ResponseEntity.ok(ApiResponse.success("Skill updated successfully", updatedSkill));
    }
}
