package SkillMatch.util;

import SkillMatch.model.User;

public class PasswordResetConfirmationEmailContext extends AbstractEmailContext {
    
    @Override
    public <T> void init(T context) {
        User user = (User) context;
        put("firstName", user.getFullName());
        put("logoUrl", "https://res.cloudinary.com/dflsnes44/image/upload/v1770537539/skillmatch-logo_ufunkh.png");
        setTemplateLocation("mailing/password-reset-confirmation");
        setSubject("Password Reset Confirmation - SkillMatch");
        setFrom("mbah18791@gmail.com");
        setTo(user.getEmail());
    }
}
