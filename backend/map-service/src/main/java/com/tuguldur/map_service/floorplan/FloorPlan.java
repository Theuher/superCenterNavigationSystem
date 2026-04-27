package com.tuguldur.map_service.floorplan;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "floor_plans")
@CompoundIndexes({
        @CompoundIndex(name = "floor_name_idx", def = "{'floor': 1, 'name': 1}")
})
public class FloorPlan {

    @Id
    private String id;

    private String name;

    private Integer floor;

    private String imageUrl;

    private String note;

}

