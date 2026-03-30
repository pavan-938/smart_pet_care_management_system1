package com.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Long id;
    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin("0.0")
    private BigDecimal price;

    @Min(0)
    private Integer stockQuantity;

    private String imageUrl;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;
}
