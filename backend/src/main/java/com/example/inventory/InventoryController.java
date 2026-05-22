package com.example.inventory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class InventoryController {

    @Autowired
    private ProductRepository repository;

    @GetMapping
    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return repository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return repository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setQuantity(productDetails.getQuantity());
                    product.setPrice(productDetails.getPrice());
                    return ResponseEntity.ok(repository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStock() {
        return repository.findAll().stream()
                .filter(p -> p.getQuantity() < 5)
                .collect(Collectors.toList());
    }

    @GetMapping("/total-value")
    public double getTotalValue() {
        return repository.findAll().stream()
                .mapToDouble(p -> p.getQuantity() * p.getPrice())
                .sum();
    }
}
