package SkillMatch.util;

import SkillMatch.model.User;
import org.springframework.web.util.UriComponentsBuilder;

public class AccountVerificationEmailContext extends AbstractEmailContext{
    private String token;
    
    @Override
    public <T> void init(T context) {
        User user= (User) context;
        put("firstName",user.getFullName());
        put("logoUrl", "https://res.cloudinary.com/dflsnes44/image/upload/v1770537539/skillmatch-logo_ufunkh.png");
        setTemplateLocation("mailing/email-verification");
        setSubject("Verify Your Email - SkillMatch");
        setFrom("mbah18791@gmail.com"); 
        setTo(user.getEmail());
    }

    public void setToken(String token){
        this.token=token;
        put("token",token);
    }

    public void buildVerificationUrl(final String baseURL,final String token){
        final String url= UriComponentsBuilder.fromUriString(baseURL).path("/register/verify").queryParam("token",token).toUriString();
        put("verificationURL",url);
    }
}
