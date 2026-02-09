package SkillMatch.repository;


import SkillMatch.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TokenRepo extends JpaRepository<Token,Long> {
    Token findByToken(String jwt);
}
