package com.saverio.wesportbackend.repository;

import com.saverio.wesportbackend.model.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, UUID> {
    long countByEvent_Id(Long eventId);
    boolean existsByEvent_IdAndUser_Id(Long eventId, UUID userId);
    List<EventParticipant> findByEvent_Id(Long eventId);
    void deleteAllByEvent_Id(Long eventId);
    Optional<EventParticipant> findByEvent_IdAndUser_Id(Long eventId, UUID userId);
    void deleteByEvent_IdAndUser_Id(Long eventId, UUID userId);
}
