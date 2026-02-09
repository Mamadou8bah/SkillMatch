package SkillMatch.controller;

import SkillMatch.model.Application;
import SkillMatch.service.ApplicationService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apply")
@RequiredArgsConstructor
public class ApplicationController {


    private final ApplicationService service;

    @PostMapping
    public ResponseEntity<Application> submit(@Valid @RequestBody Long jobId) {
        Application savedApp = service.submitApplication(jobId);
        return ResponseEntity.ok(savedApp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplication(@PathVariable Long id) {
        Application app = service.getApplicationById(id);
        return ResponseEntity.ok(app);
    }

    @GetMapping("/submitted/{id}")
    public ResponseEntity<List<Application>> submitted(@PathVariable Long id) {
        List<Application> applications = service.getAlApplicationsPerJob(id);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/myapplications")
    public ResponseEntity<List<Application>> getMyApplications() {
        return ResponseEntity.ok(service.getAllUserApplications());
    }
}
