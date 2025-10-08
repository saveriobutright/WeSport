package com.saverio.wesportbackend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record NewLocationRequest(@NotBlank String name, @NotBlank String address, @DecimalMin(value = "-90") @DecimalMax(value = "90") Double lat, @DecimalMin(value = "-180") @DecimalMax(value = "180") Double lng) {}
