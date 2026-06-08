package com.project.aicrm.service;

import com.project.aicrm.entity.Lead;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(AsyncAnalysisService.class);

    private final LeadService leadService;
    private final ActivityLogService activityLogService;

    public AsyncAnalysisService(LeadService leadService, ActivityLogService activityLogService) {
        this.leadService = leadService;
        this.activityLogService = activityLogService;
    }

    @Async
    public void analyzeLeadAsync(Long leadId) {
        logger.info("Starting async analysis for lead: {}", leadId);
        try {
            Lead analyzed = leadService.analyzeLead(leadId);
            logger.info("Async analysis completed for lead: {} with score: {}", leadId, analyzed.getScore());
        } catch (Exception e) {
            logger.error("Failed to analyze lead {}: {}", leadId, e.getMessage(), e);
            activityLogService.logActivity(leadId, "ANALYSIS_FAILED", "AI Analysis failed: " + e.getMessage(), null);
        }
    }
}