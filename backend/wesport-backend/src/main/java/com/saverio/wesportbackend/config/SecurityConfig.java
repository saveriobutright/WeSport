package com.saverio.wesportbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.cors(Customizer.withDefaults());

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**", "/_ping").permitAll()
                .anyRequest().authenticated()
        );


        http.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(grantedAuthoritiesExtractor()))
        );

        return http.build();
    }

    private JwtAuthenticationConverter grantedAuthoritiesExtractor() {
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            Collection<?> rawRoles = realmAccess != null
                    ? (Collection<?>) realmAccess.getOrDefault("roles", Collections.emptyList())
                    : Collections.emptyList();

            List<String> roles = rawRoles.stream()
                    .map(Object::toString)
                    .toList();

            List<GrantedAuthority> authorities = roles.stream()
                    .map(r -> "ROLE_" + r) // USER -> ROLE_USER, ORGANIZER -> ROLE_ORGANIZER
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            return authorities;
        });
        return converter;
    }
}