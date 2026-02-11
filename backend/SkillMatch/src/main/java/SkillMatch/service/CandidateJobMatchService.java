package SkillMatch.service;

import SkillMatch.dto.CandidateJobMatchDTO;
import SkillMatch.model.CandidateJobMatch;
import SkillMatch.model.JobPost;
import SkillMatch.model.Skill;
import SkillMatch.model.User;
import SkillMatch.repository.CandidateJobMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateJobMatchService {
    private final CandidateJobMatchRepository repository;

    public List<CandidateJobMatchDTO> getTopMatches(User candidate, int limit) {
        return loadMatches(candidate, limit).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<JobPost> getTopJobPosts(User candidate, int limit) {
        return loadMatches(candidate, limit).stream()
                .map(CandidateJobMatch::getJobPost)
                .collect(Collectors.toList());
    }

    private List<CandidateJobMatch> loadMatches(User candidate, int limit) {
        if (candidate == null) return Collections.emptyList();
        int finalLimit = Math.max(1, limit);
        Pageable pageable = PageRequest.of(0, finalLimit);
        return repository.findByCandidateOrderByScoreDesc(candidate, pageable);
    }

    private CandidateJobMatchDTO toDto(CandidateJobMatch match) {
        JobPost job = match.getJobPost();
        return CandidateJobMatchDTO.builder()
                .jobId(job.getId())
                .title(job.getTitle())
                .companyName(job.getCompanyName())
                .companyLogo(job.getCompanyLogo())
                .locationType(job.getLocationType() != null ? job.getLocationType().name() : null)
                .jobUrl(job.getJobUrl())
                .source(job.getSource())
                .score(match.getScore())
                .computedAt(match.getComputedAt())
                .requiredSkills(job.getRequiredSkills() != null ?
                        job.getRequiredSkills().stream().map(Skill::getTitle).collect(Collectors.toList()) :
                        Collections.emptyList())
                .build();
    }
}
