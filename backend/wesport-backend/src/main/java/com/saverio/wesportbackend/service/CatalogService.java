package com.saverio.wesportbackend.service;

import com.saverio.wesportbackend.dto.NewLocationRequest;
import com.saverio.wesportbackend.model.Location;
import com.saverio.wesportbackend.model.Sport;
import com.saverio.wesportbackend.repository.SportRepository;
import com.saverio.wesportbackend.repository.LocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional
public class CatalogService {

    private final SportRepository sportRepo;
    private final LocationRepository locationRepo;

    @PersistenceContext
    private EntityManager em;

    public CatalogService(SportRepository sportRepo, LocationRepository locationRepo) {
        this.sportRepo = sportRepo;
        this.locationRepo = locationRepo;
    }

    public Sport createSport(String rawName) {
        String name = rawName == null ? "" : rawName.trim();
        if (name.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sport name is required");
        }
        Long count = em.createQuery(
                        "select count(s) from Sport s where lower(s.name) = lower(:n)", Long.class)
                .setParameter("n", name)
                .getSingleResult();
        if (count != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sport already exists");
        }
        Sport s = new Sport();
        s.setName(name);
        return sportRepo.save(s);
    }

    public Location createLocation(NewLocationRequest req) {
        String name = req.name() == null ? "" : req.name().trim();
        String address = req.address() == null ? "" : req.address().trim();
        if (name.isEmpty() || address.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and address are required");
        }
        Long count = em.createQuery(
                        "select count(l) from Location l " +
                                "where lower(l.name) = lower(:n) and lower(l.address) = lower(:a)", Long.class)
                .setParameter("n", name)
                .setParameter("a", address)
                .getSingleResult();
        if (count != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Location already exists");
        }
        Location l = new Location();
        l.setName(name);
        l.setAddress(address);
        l.setLat(req.lat());
        l.setLng(req.lng());
        return locationRepo.save(l);
    }
}
