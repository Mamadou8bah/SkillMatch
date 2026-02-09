package SkillMatch.controller;

import SkillMatch.dto.EmployerDTO;
import SkillMatch.model.Employer;
import SkillMatch.service.EmployerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("/employers")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerService service;

    @GetMapping
    public ResponseEntity<?>getEmployers(){
        return ResponseEntity.ok(service.getEmployers());
    }

    @GetMapping("/employer/{id}")
    public ResponseEntity<?> getEmployerById( @PathVariable long id){
        return ResponseEntity.ok(service.getEmployerById(id));
    }
    @PostMapping
    public ResponseEntity<?> addEmployer(@RequestBody EmployerDTO employer, MultipartFile file) throws IOException {
        return ResponseEntity.ok(service.addEmployer(employer, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployer(@PathVariable long id){
        service.deleteEmployer(id);
        return ResponseEntity.ok("Profile Deleted");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployer(@PathVariable long id, @RequestBody EmployerDTO employer, MultipartFile file) throws IOException {
        service.UpdateEmployer(id, employer, file);
        return ResponseEntity.ok("Profile Updated");
    }
}
