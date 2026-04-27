package com.tuguldur.product_service.product;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
@CompoundIndexes({
        @CompoundIndex(name = "name_category_idx", def = "{'name': 1, 'categoryId': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    private String id;

    @Indexed
    private String name;

    @Indexed(unique = true)
    private String sku;

    private String description;

    private BigDecimal price;

    private String categoryId;

    private String locationId;

    private String floorPlanId;

    private Double mapX;

    private Double mapY;

    private String imageUrl;
}

