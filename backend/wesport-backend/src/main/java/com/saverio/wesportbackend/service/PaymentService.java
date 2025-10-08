package com.saverio.wesportbackend.service;

import com.saverio.wesportbackend.model.EventStatus;
import com.saverio.wesportbackend.model.Payment;
import com.saverio.wesportbackend.repository.EventParticipantRepository;
import com.saverio.wesportbackend.repository.EventRepository;
import com.saverio.wesportbackend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {
    private final PaymentRepository paymentRepo;
    private final EventRepository eventRepo;
    private final EventParticipantRepository participantRepo;
    private final AuthFacade auth;

    @Transactional
    public Payment simulatePay(Long eventId, BigDecimal amount, Jwt jwt) {
        var e = eventRepo.findByIdForUpdate(eventId).orElseThrow();
        var user = auth.currentUser(jwt);

        var pay = Payment.builder()
                .event(e)
                .user(user)
                .amount(amount)
                .status("COMPLETED")
                .createdAt(OffsetDateTime.now())
                .build();
        paymentRepo.save(pay);

        // marca il partecipante come pagato
        var participants = participantRepo.findByEvent_Id(eventId);
        participants.stream()
                .filter(pp -> pp.getUser().getId().equals(user.getId()))
                .findFirst()
                .ifPresent(pp -> { pp.setPaid(true); participantRepo.save(pp); });

        // se tutti hanno pagato e l'evento è FULL -> COMPLETED
        boolean allPaid = participants.stream().allMatch(pp -> pp.isPaid());
        if (allPaid && e.getStatus() == EventStatus.FULL) {
            e.setStatus(EventStatus.COMPLETED);
            eventRepo.save(e);
        }

        return pay;
    }
}
