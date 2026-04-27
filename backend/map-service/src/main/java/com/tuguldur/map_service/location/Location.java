package com.tuguldur.map_service.location;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "locations")
@CompoundIndexes({
        @CompoundIndex(name = "zone_aisle_shelf_idx", def = "{'zone': 1, 'aisle': 1, 'shelf': 1}")
})
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

