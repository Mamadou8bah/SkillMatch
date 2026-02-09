package SkillMatch.service;

import SkillMatch.util.AbstractEmailContext;
import com.resend.Resend;
import com.resend.services.emails.model.SendEmailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
public class DefaultEmailService implements EmailService{

    private final SpringTemplateEngine templateEngine;

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from}")
    private String resendFrom;

    @Override
    public void sendMail(AbstractEmailContext email) {
        Context context=new Context();
        context.setVariables(email.getContext());
        String emailContent=templateEngine.process(email.getTemplateLocation(),context);

        Resend resend = new Resend(resendApiKey);

        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .from(resendFrom)
                .to(email.getTo())
                .subject(email.getSubject())
                .html(emailContent)
                .build();

        try {
            resend.emails().send(sendEmailRequest);
            log.info("Email sent successfully to: {}", email.getTo());
        } catch (Exception e) {
            // Graceful degradation: Log error but do not throw exception to prevent request failure
            log.error("EMAIL QUOTA HIT OR FAILURE: Failed to send email to {}. Error: {}", email.getTo(), e.getMessage());
            // In a free-tier environment, we cannot guarantee email delivery
        }
    }
}
