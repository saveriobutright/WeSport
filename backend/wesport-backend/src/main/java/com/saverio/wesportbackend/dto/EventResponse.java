package com.saverio.wesportbackend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record EventResponse(Long id, String sport, String location, String address, OffsetDateTime startAt, Integer maxParticipants, Integer currentParticipants, BigDecimal totalCost, String status, String organizerName) {
}
