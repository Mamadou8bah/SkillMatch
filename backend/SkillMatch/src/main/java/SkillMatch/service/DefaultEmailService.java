package SkillMatch.service;

import SkillMatch.util.AbstractEmailContext;
import com.resend.Resend;
import com.resend.services.emails.model.SendEmailRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultEmailService implements EmailService{

    private final SpringTemplateEngine templateEngine;
    private Resend resend;

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from}")
    private String resendFrom;

    @PostConstruct
    public void init() {
        resend = new Resend(resendApiKey);
    }

    @Override
    @Async("taskExecutor")
    public void sendMail(AbstractEmailContext email) {
        try {
            Context context=new Context();
            context.setVariables(email.getContext());
            String emailContent=templateEngine.process(email.getTemplateLocation(),context);

            SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                    .from(resendFrom)
                    .to(email.getTo())
                    .subject(email.getSubject())
                    .html(emailContent)
                    .build();

            resend.emails().send(sendEmailRequest);
            log.info("Email sent successfully to: {}", email.getTo());
        } catch (Exception e) {
            // Graceful degradation: Log error but do not throw exception to prevent request failure
            log.error("EMAIL FAILURE: Failed to send email to {}. Error: {}", email.getTo(), e.getMessage());
            // In a free-tier environment, we cannot guarantee email delivery
        }
    }
}
