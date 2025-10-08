package com.saverio.wesportbackend.controller;

import jakarta.validation.Valid;
import com.saverio.wesportbackend.dto.*;
import com.saverio.wesportbackend.mapper.EventMapper;
import com.saverio.wesportbackend.model.Event;
import com.saverio.wesportbackend.repository.EventParticipantRepository;
import com.saverio.wesportbackend.service.EventService;
import com.saverio.wesportbackend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class EventController {

    private final EventService eventService;
    private final PaymentService paymentService;
    private final EventParticipantRepository participantRepo;
    private final EventMapper mapper;

    // Lista pubblica
    @GetMapping("/public/events")
    public List<EventResponse> list() {
        return eventService.publicList().stream().map(e ->
                mapper.toResponse(e, (int) participantRepo.countByEvent_Id(e.getId()))
        ).toList();
    }

    // Dettaglio evento (pubblico)
    @GetMapping("/public/events/{id}")
    public EventResponse get(@PathVariable Long id) {
        var e = eventService.publicList().stream()
                .filter(x -> x.getId().equals(id)).findFirst().orElseThrow();
        return mapper.toResponse(e, (int) participantRepo.countByEvent_Id(id));
    }

    // Creazione (solo ORGANIZER)
    @PostMapping("/events")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventResponse> create(@Valid @RequestBody CreateEventRequest req,
                                                @AuthenticationPrincipal Jwt jwt) {
        Event e = eventService.create(req, jwt);
        var resp = mapper.toResponse(e, 0);
        return ResponseEntity.ok(resp);
    }

    // Iscrizione (utente loggato)
    @PostMapping("/events/{id}/join")
    public ResponseEntity<EventResponse> join(@PathVariable Long id,
                                              @RequestBody JoinEventRequest req,
                                              @AuthenticationPrincipal Jwt jwt) {
        var e = eventService.join(id, req.roleName(), jwt);
        var resp = mapper.toResponse(e, (int) participantRepo.countByEvent_Id(id));
        return ResponseEntity.ok(resp);
    }

    // Abbandono evento (utente loggato)
    @DeleteMapping("/events/{id}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventResponse> leave(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {

        var e = eventService.leave(id, jwt);
        var resp = mapper.toResponse(e, (int) participantRepo.countByEvent_Id(id));
        return ResponseEntity.ok(resp);
    }

    // Quota individuale (autenticato)
    @GetMapping("/events/{id}/quota")
    public ResponseEntity<java.math.BigDecimal> quota(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.quotaIndividuale(id));
    }

    // Simulazione pagamento (autenticato)
    @PostMapping("/events/{id}/pay")
    public PaymentResponse pay(@PathVariable Long id,
                               @AuthenticationPrincipal Jwt jwt) {
        var amount = eventService.quotaIndividuale(id);
        var p = paymentService.simulatePay(id, amount, jwt);
        return new PaymentResponse(p.getStatus(), p.getAmount());
    }

    //Modifica (solo ORGANIZER + owner)
    @PutMapping("/events/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateEventRequest req,
                                                @AuthenticationPrincipal Jwt jwt) {
        var e = eventService.update(id, req, jwt);
        var resp = mapper.toResponse(e, (int) participantRepo.countByEvent_Id(id));
        return ResponseEntity.ok(resp);
    }

    // Eliminazione (solo ORGANIZER + owner)
    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal Jwt jwt) {
        eventService.delete(id, jwt);
        return ResponseEntity.noContent().build();
    }
}
