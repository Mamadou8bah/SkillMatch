package SkillMatch.model;

import SkillMatch.util.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@EntityListeners(AuditingEntityListener.class)
@Builder
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

    @Column(nullable = true)
    private String profession;

    @Column(nullable = true)
    private String industry;

    @Column(nullable = true)
    private String experienceLevel;

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
    private List<Token>tokens = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<SecureToken>secureTokens = new ArrayList<>();

    private boolean accountVerified;

    private boolean loginDisabled;

    private int registrationStage = 1;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private Set<Application> applications = new java.util.HashSet<>();

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Skill> skills = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role != null ? role.getAuthorities() : java.util.Collections.emptyList();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !loginDisabled;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
