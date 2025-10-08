package com.saverio.wesportbackend.dto;

import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

public record CreateEventRequest(
        @NotNull Long sportId,
        @NotNull Long locationId,
        @FutureOrPresent OffsetDateTime startAt,
        @NotNull @Min(1) Integer maxParticipants,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal totalCost) {
}
