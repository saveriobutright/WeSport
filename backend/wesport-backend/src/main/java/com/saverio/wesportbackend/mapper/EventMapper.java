package com.saverio.wesportbackend.mapper;

import com.saverio.wesportbackend.dto.EventResponse;
import com.saverio.wesportbackend.model.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {
    public EventResponse toResponse(Event e, int currentParticipants) {
        return new EventResponse(
                e.getId(),
                e.getSport().getName(),
                e.getLocation().getName(),
                e.getLocation().getAddress(),
                e.getStartAt(),
                e.getMaxParticipants(),
                currentParticipants,
                e.getTotalCost(),
                e.getStatus().name(),
                e.getOrganizer().getDisplayName()
        );
    }
}
