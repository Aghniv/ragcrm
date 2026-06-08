package com.project.aicrm.controller;

import com.project.aicrm.dto.LeadRequest;
import com.project.aicrm.entity.Lead;
import com.project.aicrm.entity.LeadStatus;
import com.project.aicrm.repository.LeadRepository;
import com.project.aicrm.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;
    private final LeadRepository leadRepository;

    public LeadController(LeadService leadService, LeadRepository leadRepository) {
        this.leadService = leadService;
        this.leadRepository = leadRepository;
    }

    @PostMapping
    public ResponseEntity<Lead> createLead(@Valid @RequestBody LeadRequest request) {
        return ResponseEntity.ok(leadService.createLead(request));
    }

    @GetMapping
    public ResponseEntity<?> getAllLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        // Cap page size at 100
        int cappedSize = Math.min(size, 100);

        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, cappedSize, Sort.by(direction, sortBy));

        if (search != null && !search.isEmpty() && status != null && !status.isEmpty()) {
            try {
                LeadStatus leadStatus = LeadStatus.valueOf(status.toUpperCase());
                Page<Lead> leads = leadRepository.findByStatusAndSearch(leadStatus, search, pageable);
                return ResponseEntity.ok(leads);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status value");
            }
        } else if (search != null && !search.isEmpty()) {
            Page<Lead> leads = leadRepository.searchLeads(search, pageable);
            return ResponseEntity.ok(leads);
        } else if (status != null && !status.isEmpty()) {
            try {
                LeadStatus leadStatus = LeadStatus.valueOf(status.toUpperCase());
                Page<Lead> leads = leadRepository.findByStatus(leadStatus, pageable);
                return ResponseEntity.ok(leads);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status value");
            }
        }

        Page<Lead> leads = leadRepository.findAll(pageable);
        return ResponseEntity.ok(leads);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable Long id) {
        return leadService.getLeadById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable Long id, @Valid @RequestBody LeadRequest request) {
        return ResponseEntity.ok(leadService.updateLead(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Lead> analyzeLead(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.analyzeLead(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Lead>> getLeadsByStatus(@PathVariable LeadStatus status) {
        return ResponseEntity.ok(leadService.getLeadsByStatus(status));
    }

    // Bulk operations
    @DeleteMapping("/bulk")
    public ResponseEntity<List<Lead>> deleteLeadsBulk(@RequestBody List<Long> ids) {
        List<Lead> deleted = leadService.deleteLeadsBulk(ids);
        return ResponseEntity.ok(deleted);
    }

    @PutMapping("/bulk/status")
    public ResponseEntity<List<Lead>> updateLeadsBulkStatus(
            @RequestBody List<Long> ids,
            @RequestParam LeadStatus status) {
        List<Lead> updated = leadService.updateLeadsBulkStatus(ids, status);
        return ResponseEntity.ok(updated);
    }

    // Export CSV
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportLeadsCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        List<Lead> leads;
        if (search != null && !search.isEmpty() && status != null && !status.isEmpty()) {
            try {
                LeadStatus leadStatus = LeadStatus.valueOf(status.toUpperCase());
                leads = leadRepository.findByStatusAndSearch(leadStatus, search, Pageable.unpaged()).getContent();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (status != null && !status.isEmpty()) {
            try {
                LeadStatus leadStatus = LeadStatus.valueOf(status.toUpperCase());
                leads = leadRepository.findByStatus(leadStatus, Pageable.unpaged()).getContent();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            leads = leadRepository.findAll();
        }

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Email,Phone,Company,Source,Status,Score,Urgency,Created At,Updated At\n");

        for (Lead lead : leads) {
            csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s,%d,%s,%s,%s\n",
                    lead.getId(),
                    escapeCsv(lead.getName()),
                    escapeCsv(lead.getEmail()),
                    escapeCsv(lead.getPhone()),
                    escapeCsv(lead.getCompany()),
                    escapeCsv(lead.getSource()),
                    lead.getStatus(),
                    lead.getScore() != null ? lead.getScore() : 0,
                    lead.getUrgency() != null ? lead.getUrgency() : "",
                    lead.getCreatedAt(),
                    lead.getUpdatedAt()));
        }

        byte[] csvBytes = csv.toString().getBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "leads_export.csv");
        headers.setContentLength(csvBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvBytes);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}