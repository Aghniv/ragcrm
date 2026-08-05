package com.project.aicrm.controller;

import com.project.aicrm.entity.Opportunity;
import com.project.aicrm.service.OpportunityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityService opportunityService;

    public OpportunityController(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @PostMapping
    public ResponseEntity<Opportunity> create(@Valid @RequestBody OpportunityRequest req) {
        Opportunity o = new Opportunity();
        o.setName(req.name());
        o.setCustomerId(req.customerId());
        o.setContactId(req.contactId());
        o.setAmount(req.amount());
        o.setCurrency(req.currency());
        o.setExpectedCloseDate(req.expectedCloseDate());
        o.setProbabilityPct(req.probabilityPct());
        o.setDescription(req.description());
        if (req.stage() != null) o.setStage(req.stage());
        return ResponseEntity.ok(opportunityService.create(o));
    }

    @GetMapping
    public ResponseEntity<Page<Opportunity>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Opportunity.Stage stage) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(opportunityService.list(stage, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Opportunity> get(@PathVariable Long id) {
        return opportunityService.get(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<List<Opportunity>> byCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(opportunityService.byCustomer(customerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Opportunity> update(@PathVariable Long id, @Valid @RequestBody OpportunityRequest req) {
        Opportunity patch = new Opportunity();
        patch.setName(req.name());
        patch.setCustomerId(req.customerId());
        patch.setContactId(req.contactId());
        patch.setAmount(req.amount());
        patch.setCurrency(req.currency());
        patch.setExpectedCloseDate(req.expectedCloseDate());
        patch.setProbabilityPct(req.probabilityPct());
        patch.setDescription(req.description());
        patch.setStage(req.stage());
        return ResponseEntity.ok(opportunityService.update(id, patch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        opportunityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record OpportunityRequest(
            @NotBlank String name,
            Long customerId,
            Long contactId,
            BigDecimal amount,
            String currency,
            LocalDate expectedCloseDate,
            Integer probabilityPct,
            Opportunity.Stage stage,
            String description
    ) {}
}
