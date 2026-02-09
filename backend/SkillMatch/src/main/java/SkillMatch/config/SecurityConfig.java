package SkillMatch.config;
import SkillMatch.util.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    JwtAuthFilter filter;
    @Autowired
    AuthenticationProvider authenticationProvider;

        @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:4200,https://localhost:3000}")
        private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/register/verify",
                                "/",
                                "/employers",
                                "/ws/**",
                                "/api/auth/password-reset/request",
                                "/api/auth/password-reset/validate/*",
                                "/api/auth/password-reset/confirm",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/api/auth/register/**",
                                "api/auth/register/verify/**",
                                "register/verify/**"
                        ).permitAll()
                        .requestMatchers("/post/add").hasAnyRole("EMPLOYER", "ADMIN")
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/user/**", "/experience/**", "/education/**", "/skill/**",
                                "/candidates/**", "/post/**", "/api/apply/**").authenticated()
                        .anyRequest().authenticated()
                )

                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .authenticationProvider(authenticationProvider)
                .build();
    }

    @Bean
                public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
                        configuration.setAllowedOriginPatterns(java.util.Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
