package com.saverio.wesportbackend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sport")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Sport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;
}