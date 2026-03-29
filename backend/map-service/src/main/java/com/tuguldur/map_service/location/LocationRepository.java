package com.tuguldur.map_service.location;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LocationRepository extends MongoRepository<Location, String> {
    Optional<Location> findByCodeIgnoreCase(String code);
}

