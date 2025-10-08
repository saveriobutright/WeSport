package com.saverio.wesportbackend.repository;

import com.saverio.wesportbackend.model.Event;
import com.saverio.wesportbackend.model.EventStatus;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByStartAtAsc(EventStatus status);

    List<Event> findByOrganizer_KeycloakIdOrderByStartAtDesc(String keycloakId);

    @Query("""
       select distinct ep.event 
       from EventParticipant ep 
       where ep.user.keycloakId = :keycloakId 
       order by ep.event.startAt desc
       """)
    List<Event> findParticipatingEventsByKeycloakId(@Param("keycloakId") String keycloakId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "5000"))
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id")  Long id);
}
