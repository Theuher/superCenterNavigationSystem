package com.tuguldur.product_service.category;

import com.tuguldur.product_service.category.dto.CategoryRequest;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category findById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found."));
    }

    public Category create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new IllegalArgumentException("Category with this name already exists.");
        }
        Category category = new Category();
        category.setName(request.name().trim());
        category.setDescription(request.description());
        return categoryRepository.save(category);
    }

    public Category update(String id, CategoryRequest request) {
        Category category = findById(id);
        categoryRepository.findByNameIgnoreCase(request.name().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Category with this name already exists.");
                });

        category.setName(request.name().trim());
        category.setDescription(request.description());
        return categoryRepository.save(category);
    }

    public void delete(String id) {
        Category category = findById(id);
        categoryRepository.delete(category);
    }
}

