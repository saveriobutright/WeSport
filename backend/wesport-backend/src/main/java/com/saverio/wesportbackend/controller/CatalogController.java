package com.saverio.wesportbackend.controller;

import com.saverio.wesportbackend.model.Location;
import com.saverio.wesportbackend.model.Sport;
import com.saverio.wesportbackend.repository.SportRepository;
import com.saverio.wesportbackend.repository.LocationRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CatalogController {

    private final SportRepository sportRepo;
    private final LocationRepository locationRepo;

    public CatalogController(SportRepository sportRepo, LocationRepository locationRepo) {
        this.sportRepo = sportRepo;
        this.locationRepo = locationRepo;
    }

    @GetMapping("/api/public/sports")
    public List<Sport> sports() {
        return sportRepo.findAll();
    }

    @GetMapping("/api/public/locations")
    public List<Location> locations() {
        return locationRepo.findAll();
    }
}
