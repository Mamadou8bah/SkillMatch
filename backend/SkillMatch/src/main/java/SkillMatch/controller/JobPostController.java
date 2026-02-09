package SkillMatch.controller;
import SkillMatch.model.JobPost;
import SkillMatch.service.JobPostService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/post", "/jobs"})
@RequiredArgsConstructor
public class JobPostController {


    private final JobPostService service;

    @GetMapping
    public ResponseEntity<?> getJobPost(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "5") int size){
        return ResponseEntity.ok(service.getJobPost(page, size));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addJob(@Valid @RequestBody JobPost jobPost){
         service.addJob(jobPost);
         return ResponseEntity.ok("Job Added");
    }


    @GetMapping("/myjobs")
    public ResponseEntity<List<JobPost>> getMyJobs() {
        return ResponseEntity.ok(service.getJobsByLoggedInEmployer());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobPostById(@PathVariable long id){
        JobPost post= service.getJobPostById(id);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam String title){
        List<JobPost>posts= service.searchPosts(title);
        return ResponseEntity.ok(posts);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateJobPost(@PathVariable long id,@RequestBody JobPost newPost){
       JobPost post= service.updateJobPost(id,newPost);
       return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(long id){
        service.deletePost(id);
        return ResponseEntity.ok("Post Deleted");
    }
}
