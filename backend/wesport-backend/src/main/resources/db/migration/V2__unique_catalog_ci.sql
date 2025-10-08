-- Unicità case-insensitive su sport.name
CREATE UNIQUE INDEX IF NOT EXISTS ux_sport_name_ci
    ON sport (LOWER(name));

-- Unicità case-insensitive su (location.name, location.address)
CREATE UNIQUE INDEX IF NOT EXISTS ux_location_name_addr_ci
    ON location (LOWER(name), LOWER(address));
