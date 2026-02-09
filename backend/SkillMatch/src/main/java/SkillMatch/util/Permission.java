package SkillMatch.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Permission {

    ADMIN_READ("admin:read"),
    ADMIN_WRITE("admin:write"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_DELETE("admin:delete"),

    CANDIDATE_READ("candidate:read"),
    CANDIDATE_WRITE("candidate:write"),
    CANDIDATE_UPDATE("candidate:update"),
    CANDIDATE_DELETE("candidate:delete"),

    EMPLOYER_READ("employer:read"),
    EMPLOYER_WRITE("employer:write"),
    EMPLOYER_UPDATE("employer:update"),
    EMPLOYER_DELETE("employer:delete");




    private final String permission;
}
