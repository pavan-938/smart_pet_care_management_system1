package com.petcare.service;

import com.petcare.dto.ProductDto;
import com.petcare.entity.Category;
import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts();

    ProductDto getProductById(Long id);

    ProductDto createProduct(ProductDto productDto);

    ProductDto updateProduct(Long id, ProductDto productDto);

    void deleteProduct(Long id);

    List<Category> getAllCategories();

    Category createCategory(Category category);
}
