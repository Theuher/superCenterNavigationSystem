package com.tuguldur.map_service.floorplan;

import com.tuguldur.map_service.floorplan.dto.FloorPlanRequest;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class FloorPlanService {

    private final FloorPlanRepository floorPlanRepository;

    public FloorPlanService(FloorPlanRepository floorPlanRepository) {
        this.floorPlanRepository = floorPlanRepository;
    }

    public List<FloorPlan> findAll() {
        return floorPlanRepository.findAll().stream()
                .sorted(Comparator.comparing(FloorPlan::getFloor)
                        .thenComparing(FloorPlan::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public FloorPlan findById(String id) {
        return floorPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Floor plan not found."));
    }

    public FloorPlan create(FloorPlanRequest request) {
        FloorPlan floorPlan = new FloorPlan();
        applyRequest(floorPlan, request);
        return floorPlanRepository.save(floorPlan);
    }

    public FloorPlan update(String id, FloorPlanRequest request) {
        FloorPlan floorPlan = findById(id);
        applyRequest(floorPlan, request);
        return floorPlanRepository.save(floorPlan);
    }

    public void delete(String id) {
        FloorPlan floorPlan = findById(id);
        floorPlanRepository.delete(floorPlan);
    }

    private void applyRequest(FloorPlan floorPlan, FloorPlanRequest request) {
        floorPlan.setName(request.name().trim());
        floorPlan.setFloor(request.floor());
        floorPlan.setImageUrl(request.imageUrl().trim());
        floorPlan.setNote(request.note());
    }
}

