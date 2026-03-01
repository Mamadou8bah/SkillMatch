package SkillMatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@org.springframework.cache.annotation.EnableCaching
@org.springframework.scheduling.annotation.EnableScheduling
public class SkillMatchApplication {

	public static void main(String[] args) {
		String port = System.getenv("PORT");
		SpringApplication app = new SpringApplication(SkillMatchApplication.class);
		if (port != null && !port.isEmpty()) {
			app.setDefaultProperties(java.util.Collections.singletonMap("server.port", port));
		}
		app.run(args);
	}

}
