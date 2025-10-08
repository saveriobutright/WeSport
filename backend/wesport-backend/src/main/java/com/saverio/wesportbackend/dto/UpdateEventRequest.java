package com.saverio.wesportbackend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public record UpdateEventRequest(@NotNull Long sportId,
                                 @NotNull Long locationId,
                                 @NotNull OffsetDateTime startAt,
                                 @NotNull @Min(1) Integer maxParticipants,
                                 @NotNull BigDecimal totalCost) {
}
