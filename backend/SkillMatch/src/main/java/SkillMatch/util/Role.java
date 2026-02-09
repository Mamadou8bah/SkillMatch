package SkillMatch.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Set;

import static SkillMatch.util.Permission.*;

@RequiredArgsConstructor
@Getter
public enum Role {
    ADMIN(Set.of(
            ADMIN_READ,
            ADMIN_WRITE,
            ADMIN_UPDATE,
            ADMIN_DELETE,

            CANDIDATE_READ,
            CANDIDATE_WRITE,
            CANDIDATE_UPDATE,
            CANDIDATE_DELETE,

            EMPLOYER_READ,
            EMPLOYER_WRITE,
            EMPLOYER_UPDATE,
            EMPLOYER_DELETE
    )),

    EMPLOYER(Set.of(
            EMPLOYER_READ,
            EMPLOYER_WRITE,
            EMPLOYER_UPDATE,
            EMPLOYER_DELETE,

            CANDIDATE_READ
    )),

    CANDIDATE(Set.of(
            CANDIDATE_READ,
            CANDIDATE_WRITE,
            CANDIDATE_UPDATE
    ));

    private final Set<Permission> permissions;

    public List<SimpleGrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>(
                getPermissions().stream()
                        .map(permission -> new SimpleGrantedAuthority(permission.name()))
                        .toList()
        );
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
        return authorities;
    }

}
