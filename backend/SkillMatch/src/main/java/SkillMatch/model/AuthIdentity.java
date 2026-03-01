package SkillMatch.model;

import SkillMatch.util.AuthProvider;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

@Entity
public class AuthIdentity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long userId;

    @NotNull(message = "The subject must be provided ")
    private String subject;

    private AuthProvider  authProvider;

}
