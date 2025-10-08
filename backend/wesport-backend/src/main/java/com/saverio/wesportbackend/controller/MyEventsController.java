package com.saverio.wesportbackend.controller;

import com.saverio.wesportbackend.dto.EventResponse;
import com.saverio.wesportbackend.mapper.EventMapper;
import com.saverio.wesportbackend.repository.EventParticipantRepository;
import com.saverio.wesportbackend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events/mine")
public class MyEventsController {

    private final EventService eventService;
    private final EventParticipantRepository participantRepo;
    private final EventMapper mapper;

    @GetMapping("/organized")
    @PreAuthorize("isAuthenticated()")
    public List<EventResponse> myOrganized(@AuthenticationPrincipal Jwt jwt) {
        return eventService.organizedBy(jwt).stream()
                .map(e -> mapper.toResponse(e, (int) participantRepo.countByEvent_Id(e.getId())))
                .toList();
    }

    @GetMapping("/participating")
    @PreAuthorize("isAuthenticated()")
    public List<EventResponse> myParticipating(@AuthenticationPrincipal Jwt jwt) {
        return eventService.participatingBy(jwt).stream()
                .map(e -> mapper.toResponse(e, (int) participantRepo.countByEvent_Id(e.getId())))
                .toList();
    }
}

