package com.project.aicrm.service;

import com.project.aicrm.config.ResourceNotFoundException;
import com.project.aicrm.entity.Opportunity;
import com.project.aicrm.repository.OpportunityRepository;
import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final TenantSecurity tenantSecurity;

    public OpportunityService(OpportunityRepository opportunityRepository, TenantSecurity tenantSecurity) {
        this.opportunityRepository = opportunityRepository;
        this.tenantSecurity = tenantSecurity;
    }

    @Transactional
    public Opportunity create(Opportunity input) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        input.setTenantId(tenantId);
        if (input.getOwnerId() == null) input.setOwnerId(tenantSecurity.currentUserId());
        return opportunityRepository.save(input);
    }

    @Transactional(readOnly = true)
    public Page<Opportunity> list(Opportunity.Stage stage, Pageable pageable) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        if (stage != null) return opportunityRepository.findByTenantIdAndStage(tenantId, stage, pageable);
        return opportunityRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Opportunity> get(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return opportunityRepository.findByIdAndTenantId(id, tenantId);
    }

    @Transactional
    public Opportunity update(Long id, Opportunity patch) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Opportunity o = opportunityRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + id));
        if (patch.getName() != null) o.setName(patch.getName());
        if (patch.getCustomerId() != null) o.setCustomerId(patch.getCustomerId());
        if (patch.getContactId() != null) o.setContactId(patch.getContactId());
        if (patch.getOwnerId() != null) o.setOwnerId(patch.getOwnerId());
        if (patch.getStage() != null) {
            o.setStage(patch.getStage());
            if (patch.getStage() == Opportunity.Stage.WON || patch.getStage() == Opportunity.Stage.LOST) {
                o.setClosedAt(LocalDateTime.now());
            }
        }
        if (patch.getAmount() != null) o.setAmount(patch.getAmount());
        if (patch.getCurrency() != null) o.setCurrency(patch.getCurrency());
        if (patch.getExpectedCloseDate() != null) o.setExpectedCloseDate(patch.getExpectedCloseDate());
        if (patch.getProbabilityPct() != null) o.setProbabilityPct(patch.getProbabilityPct());
        if (patch.getLostReason() != null) o.setLostReason(patch.getLostReason());
        if (patch.getDescription() != null) o.setDescription(patch.getDescription());
        return opportunityRepository.save(o);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Opportunity o = opportunityRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + id));
        opportunityRepository.delete(o);
    }

    @Transactional(readOnly = true)
    public List<Opportunity> byCustomer(Long customerId) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return opportunityRepository.findByTenantIdAndCustomerId(tenantId, customerId);
    }
}
