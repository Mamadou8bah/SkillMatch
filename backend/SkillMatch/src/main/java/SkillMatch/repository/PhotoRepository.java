package SkillMatch.repository;

import SkillMatch.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    Photo findByUrl(String url);
    Photo findByPublicId(String publicId);
}
