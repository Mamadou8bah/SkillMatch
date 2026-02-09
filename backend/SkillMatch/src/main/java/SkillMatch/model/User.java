package SkillMatch.model;

import SkillMatch.util.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Data
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false,length = 100)
    private String fullName;

    @OneToOne(cascade = CascadeType.ALL,mappedBy = "user")
    private Photo photo;

    @Column(unique = true,nullable = false)
    private String email;

    @Column(nullable = true)
    private String location;

    @Column(nullable = false)
    @JsonIgnore
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    private boolean isActive;
    @CreatedDate
    @Column(nullable = false,updatable = false)
    private LocalDateTime createdAt=LocalDateTime.now();

    @OneToOne(mappedBy = "user",cascade = CascadeType.ALL)
    @JsonIgnore
    private Employer employer;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Token>tokens;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<SecureToken>secureTokens;

    private boolean accountVerified;

    private boolean loginDisabled;

    private int registrationStage = 1;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private Set<Application> applications;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Education> educations;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Experience> experiences;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Skill> skills;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role.getAuthorities();
    }

    @Override
    public String getUsername() {
        return email;
    }


}
