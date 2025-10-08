package com.saverio.wesportbackend.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Object> body(HttpStatus status, String message, HttpServletRequest req) {
        Map<String, Object> m = new HashMap<>();
        m.put("timestamp", OffsetDateTime.now().toString());
        m.put("status", status.value());
        m.put("error", status.getReasonPhrase());
        if (message != null) m.put("message", message);
        if (req != null) m.put("path", req.getRequestURI());
        return ResponseEntity.status(status).body(m);
    }

    // 400: validazione @Valid sui DTO
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> onValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        var sb = new StringBuilder("Validation failed: ");
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                sb.append(fe.getField()).append(" ").append(fe.getDefaultMessage()).append("; "));
        return body(HttpStatus.BAD_REQUEST, sb.toString(), req);
    }

    // 403: sicurezza e ruoli
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> onDenied(AccessDeniedException ex, HttpServletRequest req) {
        return body(HttpStatus.FORBIDDEN, "Accesso negato", req);
    }

    // 404: risorsa non trovata
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Object> onNotFound(NoSuchElementException ex, HttpServletRequest req) {
        return body(HttpStatus.NOT_FOUND, "Risorsa non trovata", req);
    }

    // 409: vincoli o duplicati DB
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> onIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        return body(HttpStatus.CONFLICT, "Violazione vincolo di integrità (duplicato o referenza).", req);
    }

    // 400/403/409: regole di business
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Object> onIllegalState(IllegalStateException ex, HttpServletRequest req) {
        var msg = ex.getMessage() == null ? "Operazione non consentita" : ex.getMessage();
        var m = msg.toLowerCase();

        // 403: ownership e permessi
        if (m.contains("organizzatore") || m.contains("propriet")) {
            return body(HttpStatus.FORBIDDEN, msg, req);
        }

        // 409: conflitti
        if (m.contains("iscritt") || m.contains("completo") || m.contains("già iniziato") || m.contains("iniziato")
                || m.contains("exists") || m.contains("duplic")) {
            return body(HttpStatus.CONFLICT, msg, req);
        }

        // 400: fallback per altre IllegalState
        return body(HttpStatus.BAD_REQUEST, msg, req);
    }
}
