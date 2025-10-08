package com.saverio.wesportbackend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "app_user")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, unique = true)
    private String keycloakId;  // sub OIDC

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false, unique = true)
    private String email;
}
