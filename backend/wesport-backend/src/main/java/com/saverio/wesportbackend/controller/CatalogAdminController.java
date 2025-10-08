package com.saverio.wesportbackend.controller;

import com.saverio.wesportbackend.dto.NewLocationRequest;
import com.saverio.wesportbackend.dto.NewSportRequest;
import com.saverio.wesportbackend.model.Location;
import com.saverio.wesportbackend.model.Sport;
import com.saverio.wesportbackend.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalog")
public class CatalogAdminController {

    private final CatalogService catalogService;

    public CatalogAdminController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @PostMapping("/sports")
    @PreAuthorize("hasRole('ORGANIZER')")
    public Sport createSport(@Valid @RequestBody NewSportRequest req) {
        return catalogService.createSport(req.name());
    }

    @PostMapping("/locations")
    @PreAuthorize("hasRole('ORGANIZER')")
    public Location createLocation(@Valid @RequestBody NewLocationRequest req) {
        return catalogService.createLocation(req);
    }
}