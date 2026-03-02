package SkillMatch.controller;
import SkillMatch.dto.JobResponseDTO;
import SkillMatch.model.JobPost;
import SkillMatch.service.JobPostService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping({"/post", "/jobs"})
@RequiredArgsConstructor
public class JobPostController {


    private final JobPostService service;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getJobPost(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "5") int size){
        return ResponseEntity.ok(service.getJobPost(page, size));
    }

    @GetMapping("/all")
    @Transactional(readOnly = true)
    public ResponseEntity<List<JobResponseDTO>> getAllJobs() {
        return ResponseEntity.ok(service.getAllJobs());
    }

    @GetMapping("/trending")
    @Transactional(readOnly = true)
    public ResponseEntity<List<JobResponseDTO>> getTrendingJobs(@RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(service.getTrendingJobs(size));
    }

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addJob(@Valid @RequestBody JobPost jobPost){
         service.addJob(jobPost);
         return ResponseEntity.ok("Job Added");
    }


    @GetMapping("/myjobs")
    @Transactional(readOnly = true)
    public ResponseEntity<List<JobPost>> getMyJobs() {
        return ResponseEntity.ok(service.getJobsByLoggedInEmployer());
    }

    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<?> getJobPostById(@PathVariable long id){
        JobPost post= service.getJobPostById(id);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<?> searchPosts(@RequestParam String title){
        List<JobPost>posts= service.searchPosts(title);
        return ResponseEntity.ok(posts);
    }


    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateJobPost(@PathVariable long id, @Valid @RequestBody JobPost newPost){
       JobPost post= service.updateJobPost(id,newPost);
       return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable long id){
        service.deletePost(id);
        return ResponseEntity.ok("Post Deleted");
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncJobs() {
        service.syncExternalJobs();
        return ResponseEntity.ok().body(new java.util.HashMap<String, String>() {{
            put("message", "Sync Started in Background");
            put("status", "success");
        }});
    }
}
