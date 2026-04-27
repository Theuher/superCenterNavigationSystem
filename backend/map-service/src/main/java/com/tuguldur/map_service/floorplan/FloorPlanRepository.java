package com.tuguldur.map_service.floorplan;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface FloorPlanRepository extends MongoRepository<FloorPlan, String> {
}

