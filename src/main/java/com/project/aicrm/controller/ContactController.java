package com.project.aicrm.controller;

import com.project.aicrm.entity.Contact;
import com.project.aicrm.service.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<Contact> create(@Valid @RequestBody ContactRequest req) {
        Contact c = new Contact();
        c.setName(req.name());
        c.setEmail(req.email());
        c.setPhone(req.phone());
        c.setTitle(req.title());
        c.setLinkedin(req.linkedin());
        c.setCustomerId(req.customerId());
        return ResponseEntity.ok(contactService.create(c));
    }

    @GetMapping
    public ResponseEntity<Page<Contact>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(contactService.list(pageable));
    }

    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<List<Contact>> byCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(contactService.byCustomer(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> get(@PathVariable Long id) {
        return contactService.get(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(@PathVariable Long id, @Valid @RequestBody ContactRequest req) {
        Contact patch = new Contact();
        patch.setName(req.name());
        patch.setEmail(req.email());
        patch.setPhone(req.phone());
        patch.setTitle(req.title());
        patch.setLinkedin(req.linkedin());
        patch.setCustomerId(req.customerId());
        return ResponseEntity.ok(contactService.update(id, patch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record ContactRequest(
            @NotBlank String name,
            String email,
            String phone,
            String title,
            String linkedin,
            Long customerId
    ) {}
}
