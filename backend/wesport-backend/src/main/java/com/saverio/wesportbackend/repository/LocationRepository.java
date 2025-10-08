package com.saverio.wesportbackend.repository;

import com.saverio.wesportbackend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
