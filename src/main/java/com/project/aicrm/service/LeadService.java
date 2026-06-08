package com.project.aicrm.service;

import com.project.aicrm.config.ResourceNotFoundException;
import com.project.aicrm.dto.LeadRequest;
import com.project.aicrm.entity.Lead;
import com.project.aicrm.entity.LeadStatus;
import com.project.aicrm.repository.LeadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LeadService {

    private static final Logger logger = LoggerFactory.getLogger(LeadService.class);

    private final LeadRepository leadRepository;
    private final LeadAnalysisService analysisService;
    private final EmailService emailService;
    private final GoogleSheetsService sheetsService;
    private final ActivityLogService activityLogService;

    public LeadService(LeadRepository leadRepository,
                       LeadAnalysisService analysisService,
                       EmailService emailService,
                       GoogleSheetsService sheetsService,
                       ActivityLogService activityLogService) {
        this.leadRepository = leadRepository;
        this.analysisService = analysisService;
        this.emailService = emailService;
        this.sheetsService = sheetsService;
        this.activityLogService = activityLogService;
    }

    @Transactional
    @CacheEvict(value = "leadStats", allEntries = true)
    public Lead createLead(LeadRequest request) {
        logger.info("Creating new lead: {}", request.getEmail());

        Lead lead = new Lead();
        lead.setName(request.getName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setCompany(request.getCompany());
        lead.setSource(request.getSource());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : LeadStatus.NEW);
        lead.setNotes(request.getNotes());

        Lead saved = leadRepository.save(lead);

        // Log to Google Sheets
        sheetsService.logLead(saved);

        // Send confirmation email
        emailService.sendLeadNotification(saved);

        // Log activity
        activityLogService.logActivity(saved.getId(), "CREATED", "Lead created from new lead form", null);

        logger.info("Lead created with ID: {}", saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Lead> getLeadById(Long id) {
        return leadRepository.findById(id);
    }

    @Transactional
    public Lead updateLead(Long id, LeadRequest request) {
        logger.info("Updating lead with ID: {}", id);

        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        StringBuilder changes = new StringBuilder();
        if (request.getName() != null && !request.getName().equals(lead.getName())) {
            changes.append("name: ").append(lead.getName()).append(" -> ").append(request.getName()).append("; ");
            lead.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(lead.getEmail())) {
            changes.append("email: ").append(lead.getEmail()).append(" -> ").append(request.getEmail()).append("; ");
            lead.setEmail(request.getEmail());
        }
        if (request.getPhone() != null && !request.getPhone().equals(lead.getPhone())) {
            changes.append("phone: ").append(lead.getPhone()).append(" -> ").append(request.getPhone()).append("; ");
            lead.setPhone(request.getPhone());
        }
        if (request.getCompany() != null && !request.getCompany().equals(lead.getCompany())) {
            changes.append("company: ").append(lead.getCompany()).append(" -> ").append(request.getCompany()).append("; ");
            lead.setCompany(request.getCompany());
        }
        if (request.getSource() != null && !request.getSource().equals(lead.getSource())) {
            changes.append("source: ").append(lead.getSource()).append(" -> ").append(request.getSource()).append("; ");
            lead.setSource(request.getSource());
        }
        if (request.getStatus() != null && request.getStatus() != lead.getStatus()) {
            changes.append("status: ").append(lead.getStatus()).append(" -> ").append(request.getStatus()).append("; ");
            lead.setStatus(request.getStatus());
        }
        if (request.getNotes() != null && !request.getNotes().equals(lead.getNotes())) {
            changes.append("notes updated; ");
            lead.setNotes(request.getNotes());
        }

        Lead updated = leadRepository.save(lead);

        // Log activity
        if (changes.length() > 0) {
            activityLogService.logActivity(id, "UPDATED", changes.toString(), null);
        }

        logger.info("Lead updated: {}", id);
        return updated;
    }

    @Transactional
    public void deleteLead(Long id) {
        logger.info("Deleting lead with ID: {}", id);
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead not found with id: " + id);
        }
        leadRepository.deleteById(id);

        // Log activity
        activityLogService.logActivity(id, "DELETED", "Lead deleted", null);

        logger.info("Lead deleted: {}", id);
    }

    @Transactional
    public List<Lead> deleteLeadsBulk(List<Long> ids) {
        logger.info("Bulk deleting {} leads", ids.size());
        List<Lead> deletedLeads = leadRepository.findAllById(ids);
        leadRepository.deleteAll(deletedLeads);

        // Log activity for each deleted lead
        for (Long id : ids) {
            activityLogService.logActivity(id, "BULK_DELETED", "Lead deleted in bulk operation", null);
        }

        return deletedLeads;
    }

    @Transactional
    public List<Lead> updateLeadsBulkStatus(List<Long> ids, LeadStatus status) {
        logger.info("Bulk updating {} leads to status {}", ids.size(), status);
        List<Lead> leads = leadRepository.findAllById(ids);

        for (Lead lead : leads) {
            lead.setStatus(status);
        }

        List<Lead> updated = leadRepository.saveAll(leads);

        // Log activity
        for (Lead lead : leads) {
            activityLogService.logActivity(lead.getId(), "BULK_STATUS_CHANGE", "Status changed to " + status, null);
        }

        return updated;
    }

    @Transactional
    public Lead analyzeLead(Long id) {
        logger.info("Analyzing lead with ID: {}", id);

        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        var result = analysisService.analyzeLead(lead);
        lead.setScore(result.getScore());
        lead.setUrgency(result.getUrgency());
        if (lead.getNotes() == null) {
            lead.setNotes(result.getSummary());
        } else {
            lead.setNotes(lead.getNotes() + "\n\n" + result.getSummary());
        }

        Lead analyzed = leadRepository.save(lead);

        // Log activity
        activityLogService.logActivity(id, "ANALYZED", "AI Analysis completed. Score: " + result.getScore() + ", Urgency: " + result.getUrgency(), null);

        logger.info("Lead analyzed: {}, score: {}", id, result.getScore());
        return analyzed;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leadStatuses", key = "#status.name()")
    public List<Lead> getLeadsByStatus(LeadStatus status) {
        return leadRepository.findByStatus(status);
    }
}