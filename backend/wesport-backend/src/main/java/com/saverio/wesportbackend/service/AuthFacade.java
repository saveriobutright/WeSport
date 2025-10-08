package com.saverio.wesportbackend.service;

import com.saverio.wesportbackend.model.AppUser;
import com.saverio.wesportbackend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthFacade {
    private final AppUserRepository appUserRepository;

    public AppUser currentUser(Jwt jwt) {
        var sub = jwt.getSubject();
        var username = jwt.getClaimAsString("preferred_username");
        var email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            email = username + "@local";
        }
        String finalEmail = email;
        return appUserRepository.findByKeycloakId(sub)
                .orElseGet(() -> appUserRepository.save(
                        AppUser.builder()
                                .keycloakId(sub)
                                .displayName(username != null ? username : "user")
                                .email(finalEmail)
                                .build()
                ));
    }
}