package com.tuguldur.map_service.floorplan;

import com.tuguldur.map_service.floorplan.dto.FloorPlanRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/floor-plans")
public class FloorPlanController {

    private final FloorPlanService floorPlanService;

    public FloorPlanController(FloorPlanService floorPlanService) {
        this.floorPlanService = floorPlanService;
    }

    @GetMapping
    public List<FloorPlan> findAll() {
        return floorPlanService.findAll();
    }

    @GetMapping("/{id}")
    public FloorPlan findById(@PathVariable String id) {
        return floorPlanService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public FloorPlan create(@Valid @RequestBody FloorPlanRequest request) {
        return floorPlanService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    public FloorPlan update(@PathVariable String id, @Valid @RequestBody FloorPlanRequest request) {
        return floorPlanService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        floorPlanService.delete(id);
    }
}

