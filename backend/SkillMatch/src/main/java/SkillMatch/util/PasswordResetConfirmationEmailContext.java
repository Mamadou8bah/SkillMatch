package SkillMatch.util;

import SkillMatch.model.User;

public class PasswordResetConfirmationEmailContext extends AbstractEmailContext {
    
    @Override
    public <T> void init(T context) {
        User user = (User) context;
        put("firstName", user.getFullName());
        setTemplateLocation("mailing/password-reset-confirmation");
        setSubject("Password Reset Confirmation - SkillMatch");
        setFrom("mbah18791@gmail.com");
        setTo(user.getEmail());
    }
}
