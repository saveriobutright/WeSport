package com.saverio.wesportbackend.service;

import com.saverio.wesportbackend.dto.CreateEventRequest;
import com.saverio.wesportbackend.mapper.EventMapper;
import com.saverio.wesportbackend.model.*;
import com.saverio.wesportbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepo;
    private final SportRepository sportRepo;
    private final LocationRepository locationRepo;
    private final EventParticipantRepository participantRepo;
    private final AppUserRepository userRepo;
    private final EventMapper mapper;
    private final AuthFacade auth;
    private final PaymentRepository paymentRepo;

    @Transactional
    @PreAuthorize("hasRole('ORGANIZER')")
    public Event create(CreateEventRequest req, Jwt jwt) {
        var sport = sportRepo.findById(req.sportId()).orElseThrow();
        var location = locationRepo.findById(req.locationId()).orElseThrow();
        var organizer = auth.currentUser(jwt);

        var e = Event.builder()
                .sport(sport)
                .location(location)
                .startAt(req.startAt())
                .maxParticipants(req.maxParticipants())
                .totalCost(req.totalCost())
                .status(EventStatus.OPEN)
                .organizer(organizer)
                .build();

        return eventRepo.save(e);
    }

    public List<Event> publicList() {
        return eventRepo.findAll();
    }

    @Transactional
    public Event join(Long eventId, String roleName, Jwt jwt) {
        //Utente corrente
        var user = auth.currentUser(jwt);

        //Lock pessimista sull'evento
        //Questa chiamata mette un for update sulla riga di "event", quindi
        //altre transazioni che vogliono lockare lo stesso evento aspettano
        var e = eventRepo.findByIdForUpdate(eventId).orElseThrow();

        //Evita doppie iscrizioni
        if (participantRepo.existsByEvent_IdAndUser_Id(eventId, user.getId())) {
            throw new IllegalStateException("Utente già iscritto");
        }

        //Controllo capienza
        long current = participantRepo.countByEvent_Id(eventId);
        if (current >= e.getMaxParticipants()) {
            throw new IllegalStateException("Evento al completo");
        }

        //Inserisce la partecipazione
        var p = EventParticipant.builder()
                .event(e)
                .user(user)
                .roleName(roleName == null || roleName.isBlank() ? "Giocatore" : roleName)
                .paid(false)
                .build();
        participantRepo.save(p);

        //Aggiorna lo stato se si è appena occupato l'ultimo posto
        long after = current + 1; //evita una seconda count sul DB
        if (after >= e.getMaxParticipants()) {
            e.setStatus(EventStatus.FULL);//flush a fine transazione
        }

        return e;
    }


    @Transactional
    @PreAuthorize("isAuthenticated()")
    public Event leave(Long eventId, org.springframework.security.oauth2.jwt.Jwt jwt){
        var e = eventRepo.findById(eventId).orElseThrow();
        var user = auth.currentUser(jwt);

        var epOpt = participantRepo.findByEvent_IdAndUser_Id(eventId, user.getId());
        if(epOpt.isEmpty()) {
            throw new IllegalStateException("Non risulti iscritto all'evento");
        }

        participantRepo.delete(epOpt.get());

        long after = participantRepo.countByEvent_Id(eventId);
        if(e.getStatus() == EventStatus.FULL && after < e.getMaxParticipants()) {
            e.setStatus(EventStatus.OPEN);
        }
        return e;
    }


    @Transactional
    @PreAuthorize("hasRole('ORGANIZER')")
    public Event update(Long eventId, com.saverio.wesportbackend.dto.UpdateEventRequest req, Jwt jwt) {
        var e = eventRepo.findByIdForUpdate(eventId).orElseThrow();
        var current = auth.currentUser(jwt);

        // solo l'owner può modificare
        if (!e.getOrganizer().getId().equals(current.getId())) {
            throw new IllegalStateException("Non sei l'organizzatore di questo evento");
        }

        // niente modifiche se già iniziato
        if (e.getStartAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalStateException("Evento già iniziato: non modificabile");
        }

        long count = participantRepo.countByEvent_Id(eventId);
        if (req.maxParticipants() < count) {
            throw new IllegalStateException("Max partecipanti (" + req.maxParticipants()
                    + ") non può essere inferiore agli iscritti attuali (" + count + ")");
        }

        var sport = sportRepo.findById(req.sportId()).orElseThrow();
        var location = locationRepo.findById(req.locationId()).orElseThrow();

        e.setSport(sport);
        e.setLocation(location);
        e.setStartAt(req.startAt());
        e.setMaxParticipants(req.maxParticipants());
        e.setTotalCost(req.totalCost());

        // aggiorna stato FULL/OPEN in base alla capienza
        if (count >= e.getMaxParticipants()) {
            e.setStatus(EventStatus.FULL);
        } else {
            e.setStatus(EventStatus.OPEN);
        }
        return e; // managed entity, verrà flushata
    }

    @Transactional
    @PreAuthorize("hasRole('ORGANIZER')")
    public void delete(Long eventId, Jwt jwt) {
        var e = eventRepo.findById(eventId).orElseThrow();
        var current = auth.currentUser(jwt);

        //solo l'owner può eliminare
        if (!e.getOrganizer().getId().equals(current.getId())) {
            throw new IllegalStateException("Non sei l'organizzatore di questo evento");
        }

        //blocca l'eliminazione se già iniziato
        if (e.getStartAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalStateException("Evento già iniziato: non eliminabile");
        }

        //blocca l'eliminazione se ci sono iscritti
        long count = participantRepo.countByEvent_Id(eventId);
        if (count > 0) {
            throw new IllegalStateException("Ci sono già partecipanti: elimina non consentito");
        }


        //elimina le dipendenze che referenziano l'evento
        //pagamenti
        try{
            paymentRepo.deleteAllByEvent_Id(eventId);
        } catch (Exception ignore){}

        eventRepo.delete(e);
    }

    @Transactional
    public BigDecimal quotaIndividuale(Long eventId) {
        var e = eventRepo.findById(eventId).orElseThrow();
        long count = Math.max(1, participantRepo.countByEvent_Id(eventId));
        return e.getTotalCost().divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    }

    @PreAuthorize("isAuthenticated()")
    public List<Event> organizedBy(Jwt jwt) {
        var me = auth.currentUser(jwt);
        return eventRepo.findByOrganizer_KeycloakIdOrderByStartAtDesc(me.getKeycloakId());
    }

    @PreAuthorize("isAuthenticated()")
    public List<Event> participatingBy(Jwt jwt) {
        var me = auth.currentUser(jwt);
        return eventRepo.findParticipatingEventsByKeycloakId(me.getKeycloakId());
    }
}
