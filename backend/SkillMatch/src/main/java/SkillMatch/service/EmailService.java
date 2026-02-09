package SkillMatch.service;

import SkillMatch.util.AbstractEmailContext;

public interface EmailService {
    void sendMail(final AbstractEmailContext email);
}
