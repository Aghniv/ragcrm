package com.project.aicrm.service;

import com.project.aicrm.config.ResourceNotFoundException;
import com.project.aicrm.dto.LeadRequest;
import com.project.aicrm.entity.Lead;
import com.project.aicrm.entity.LeadStatus;
import com.project.aicrm.repository.LeadRepository;
import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class LeadService {

    private static final Logger logger = LoggerFactory.getLogger(LeadService.class);

    private final LeadRepository leadRepository;
    private final LeadAnalysisService analysisService;
    private final TenantSecurity tenantSecurity;

    public LeadService(LeadRepository leadRepository,
                       LeadAnalysisService analysisService,
                       TenantSecurity tenantSecurity) {
        this.leadRepository = leadRepository;
        this.analysisService = analysisService;
        this.tenantSecurity = tenantSecurity;
    }

    @Transactional
    public Lead createLead(LeadRequest request) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        logger.info("Creating new lead in tenant {}: {}", tenantId, request.getEmail());

        Lead lead = new Lead();
        lead.setTenantId(tenantId);
        lead.setName(request.getName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setCompany(request.getCompany());
        lead.setSource(request.getSource());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : LeadStatus.NEW);
        lead.setNotes(request.getNotes());

        Lead saved = leadRepository.save(lead);
        logger.info("Lead created with ID: {} in tenant {}", saved.getId(), tenantId);
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Lead> listLeads(String search, LeadStatus status, Pageable pageable) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null;

        if (hasSearch && hasStatus) {
            return leadRepository.searchByTenantAndStatus(tenantId, status, search, pageable);
        }
        if (hasSearch) {
            return leadRepository.searchByTenant(tenantId, search, pageable);
        }
        if (hasStatus) {
            return leadRepository.findByTenantIdAndStatus(tenantId, status, pageable);
        }
        return leadRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Lead> getLeadById(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return leadRepository.findByIdAndTenantId(id, tenantId);
    }

    @Transactional
    public Lead updateLead(Long id, LeadRequest request) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));

        if (request.getName() != null) {
            lead.setName(request.getName());
        }
        if (request.getEmail() != null) {
            lead.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            lead.setPhone(request.getPhone());
        }
        if (request.getCompany() != null) {
            lead.setCompany(request.getCompany());
        }
        if (request.getSource() != null) {
            lead.setSource(request.getSource());
        }
        if (request.getStatus() != null) {
            lead.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            lead.setNotes(request.getNotes());
        }

        return leadRepository.save(lead);
    }

    @Transactional
    public void deleteLead(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
        leadRepository.delete(lead);
    }

    @Transactional
    public Lead analyzeLead(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));

        var result = analysisService.analyzeLead(lead);
        lead.setScore(result.getScore());
        lead.setUrgency(result.getUrgency());
        if (lead.getNotes() == null) {
            lead.setNotes(result.getSummary());
        } else {
            lead.setNotes(lead.getNotes() + "\n\n" + result.getSummary());
        }

        return leadRepository.save(lead);
    }
}
