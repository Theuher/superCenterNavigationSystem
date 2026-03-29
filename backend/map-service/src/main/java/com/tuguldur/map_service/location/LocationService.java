package com.tuguldur.map_service.location;

import com.tuguldur.map_service.location.dto.LocationRequest;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<Location> findAll() {
        return locationRepository.findAll().stream()
                .sorted(Comparator.comparing(Location::getCode, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public Location findById(String id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Location not found."));
    }

    public Location create(LocationRequest request) {
        locationRepository.findByCodeIgnoreCase(request.code().trim())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Location code already exists.");
                });

        Location location = new Location();
        applyRequest(location, request);
        return locationRepository.save(location);
    }

    public Location update(String id, LocationRequest request) {
        Location location = findById(id);
        locationRepository.findByCodeIgnoreCase(request.code().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Location code already exists.");
                });

        applyRequest(location, request);
        return locationRepository.save(location);
    }

    public void delete(String id) {
        Location location = findById(id);
        locationRepository.delete(location);
    }

    private void applyRequest(Location location, LocationRequest request) {
        location.setCode(request.code().trim().toUpperCase());
        location.setZone(request.zone().trim());
        location.setAisle(request.aisle().trim());
        location.setShelf(request.shelf().trim());
        location.setFloor(request.floor());
        location.setMapX(request.mapX());
        location.setMapY(request.mapY());
        location.setNote(request.note());
    }
}

