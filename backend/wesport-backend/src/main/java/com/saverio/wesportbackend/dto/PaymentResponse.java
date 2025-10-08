package com.saverio.wesportbackend.dto;

import java.math.BigDecimal;

public record PaymentResponse(String status, BigDecimal amount) {
}
