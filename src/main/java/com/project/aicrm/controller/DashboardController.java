package com.project.aicrm.controller;

import com.project.aicrm.entity.Customer;
import com.project.aicrm.entity.Opportunity;
import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import com.project.aicrm.repository.LeadRepository;
import com.project.aicrm.repository.CustomerRepository;
import com.project.aicrm.repository.ContactRepository;
import com.project.aicrm.repository.OpportunityRepository;
import com.project.aicrm.repository.TaskRepository;
import com.project.aicrm.repository.NoteRepository;
import com.project.aicrm.entity.LeadStatus;
import com.project.aicrm.entity.Task;

/**
 * Lightweight aggregations for the dashboard. Pull-based for now; can be
 * pushed via WebSocket / SSE later.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;
    private final OpportunityRepository opportunityRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final TenantSecurity tenantSecurity;

    public DashboardController(LeadRepository leadRepository,
                               CustomerRepository customerRepository,
                               ContactRepository contactRepository,
                               OpportunityRepository opportunityRepository,
                               TaskRepository taskRepository,
                               NoteRepository noteRepository,
                               TenantSecurity tenantSecurity) {
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.contactRepository = contactRepository;
        this.opportunityRepository = opportunityRepository;
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
        this.tenantSecurity = tenantSecurity;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> overview() {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        Map<String, Long> leadsByStatus = new LinkedHashMap<>();
        for (LeadStatus s : LeadStatus.values()) {
            leadsByStatus.put(s.name(), leadRepository.countByTenantIdAndStatus(tenantId, s));
        }

        Map<Opportunity.Stage, Long> oppsByStage = new LinkedHashMap<>();
        for (Opportunity.Stage s : Opportunity.Stage.values()) {
            oppsByStage.put(s, opportunityRepository.countByTenantIdAndStage(tenantId, s));
        }

        BigDecimal openPipeline = opportunityRepository.sumOpenPipelineByTenant(tenantId);
        BigDecimal wonRevenue   = opportunityRepository.sumWonByTenant(tenantId);

        // Flat string-keyed map for the frontend chart so we don't need a custom
        // Jackson serializer for the Stage enum map.
        Map<String, Long> opportunityStageBreakdown = new LinkedHashMap<>();
        for (Map.Entry<Opportunity.Stage, Long> e : oppsByStage.entrySet()) {
            opportunityStageBreakdown.put(e.getKey().name(), e.getValue());
        }

        long totalLeads          = leadRepository.countByTenantId(tenantId);
        long customersTotal      = customerRepository.countByTenantId(tenantId);
        long contactsTotal       = contactRepository.countByTenantId(tenantId);
        long opportunitiesTotal  = opportunityRepository.countByTenantId(tenantId);
        long tasksOpen           = taskRepository.findByTenantIdAndStatus(tenantId, Task.Status.OPEN,
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long notesTotal          = noteRepository.findByTenantId(tenantId,
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();

        Map<String, Object> result = new LinkedHashMap<>();
        // Counts the Quick Actions card and stat tiles consume.
        result.put("totalLeads",          totalLeads);
        result.put("leadsByStatus",       leadsByStatus);
        result.put("customersTotal",      customersTotal);
        result.put("contactsTotal",       contactsTotal);
        result.put("totalOpportunities",  opportunitiesTotal);
        result.put("opportunityStageBreakdown", opportunityStageBreakdown);
        result.put("pipelineValue",       openPipeline);
        result.put("openPipelineAmount",  openPipeline);
        result.put("wonRevenueAmount",    wonRevenue);
        result.put("tasksOpen",           tasksOpen);
        result.put("notesTotal",          notesTotal);
        // Lists the dashboard cards render.
        result.put("recentLeads",         leadRepository.findTop10ByTenantIdOrderByCreatedAtDesc(tenantId));
        result.put("topLeads",            leadRepository.findTop10ByTenantIdOrderByScoreDesc(tenantId));
        result.put("upcomingTasks",       taskRepository
                .findTop10ByTenantIdAndStatusNotOrderByDueAtAsc(tenantId, Task.Status.DONE));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "tenantId", String.valueOf(TenantContext.get())));
    }
}
