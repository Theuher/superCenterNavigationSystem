package com.tuguldur.map_service.location;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "locations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Location {

    @Id
    private String id;

    private String code;

    private String zone;

    private String aisle;

    private String shelf;

    private Integer floor;

    private String floorPlanId;

    private Double mapX;

    private Double mapY;

    private String note;

}

