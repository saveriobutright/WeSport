package com.saverio.wesportbackend.dto;

import jakarta.validation.constraints.NotBlank;

public record NewSportRequest(@NotBlank String name) {
}
