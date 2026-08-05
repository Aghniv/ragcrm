package com.project.aicrm.controller;

import com.project.aicrm.entity.Lead;
import com.project.aicrm.entity.Opportunity;
import com.project.aicrm.service.AiProposalService;
import com.project.aicrm.service.AiSummaryService;
import com.project.aicrm.service.OpportunityService;
import com.project.aicrm.service.LeadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI-generation endpoints. Each one calls the LLM, returns the raw text
 * the rep can review/edit, and writes a note on the entity so it's auditable.
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final LeadService leadService;
    private final OpportunityService opportunityService;
    private final AiSummaryService aiSummaryService;
    private final AiProposalService aiProposalService;
    private final com.project.aicrm.service.NoteService noteService;
    private final com.project.aicrm.tenant.TenantSecurity tenantSecurity;

    public AiController(LeadService leadService,
                        OpportunityService opportunityService,
                        AiSummaryService aiSummaryService,
                        AiProposalService aiProposalService,
                        com.project.aicrm.service.NoteService noteService,
                        com.project.aicrm.tenant.TenantSecurity tenantSecurity) {
        this.leadService = leadService;
        this.opportunityService = opportunityService;
        this.aiSummaryService = aiSummaryService;
        this.aiProposalService = aiProposalService;
        this.noteService = noteService;
        this.tenantSecurity = tenantSecurity;
    }

    /** POST /api/ai/leads/{id}/summary */
    @PostMapping("/leads/{id}/summary")
    public ResponseEntity<Map<String, String>> summarize(@PathVariable Long id) {
        Lead lead = leadService.getLeadById(id).orElseThrow();
        String summary = aiSummaryService.summarize(lead);
        auditAsNote("LEAD", id, "AI summary: " + summary);
        return ResponseEntity.ok(Map.of("summary", summary));
    }

    /** POST /api/ai/opportunities/{id}/proposal */
    @PostMapping("/opportunities/{id}/proposal")
    public ResponseEntity<Map<String, String>> proposal(@PathVariable Long id) {
        Opportunity opp = opportunityService.get(id).orElseThrow();
        String proposal = aiProposalService.generate(opp);
        auditAsNote("OPPORTUNITY", id, "AI drafted proposal (" + proposal.length() + " chars).");
        return ResponseEntity.ok(Map.of("proposal", proposal));
    }

    private void auditAsNote(String entityType, Long entityId, String body) {
        try {
            com.project.aicrm.entity.Note n = new com.project.aicrm.entity.Note();
            n.setEntityType(entityType);
            n.setEntityId(entityId);
            n.setBody(body);
            n.setAuthorId(tenantSecurity.currentUserId());
            noteService.create(n);
        } catch (Exception e) {
            // Never let an audit write block the AI response.
            org.slf4j.LoggerFactory.getLogger(AiController.class)
                    .warn("Failed to write AI audit note: {}", e.getMessage());
        }
    }
}
