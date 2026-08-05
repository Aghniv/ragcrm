package com.project.aicrm.controller;

import com.project.aicrm.entity.Customer;
import com.project.aicrm.service.CustomerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest req) {
        Customer c = new Customer();
        c.setName(req.name());
        c.setIndustry(req.industry());
        c.setSize(req.size());
        c.setWebsite(req.website());
        c.setBillingAddress(req.billingAddress());
        return ResponseEntity.ok(customerService.create(c));
    }

    @GetMapping
    public ResponseEntity<Page<Customer>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        int capped = Math.min(size, 100);
        Sort.Direction d = "DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, capped, Sort.by(d, sortBy));
        return ResponseEntity.ok(customerService.list(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> get(@PathVariable Long id) {
        return customerService.get(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        Customer patch = new Customer();
        patch.setName(req.name());
        patch.setIndustry(req.industry());
        patch.setSize(req.size());
        patch.setWebsite(req.website());
        patch.setBillingAddress(req.billingAddress());
        return ResponseEntity.ok(customerService.update(id, patch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record CustomerRequest(
            @NotBlank String name,
            String industry,
            String size,
            String website,
            String billingAddress
    ) {}
}
