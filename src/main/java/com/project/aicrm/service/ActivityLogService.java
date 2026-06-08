package com.project.aicrm.service;

import com.project.aicrm.entity.ActivityLog;
import com.project.aicrm.repository.ActivityLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityLogService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityLogService.class);

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public void logActivity(Long leadId, String action, String details, String userEmail) {
        ActivityLog log = new ActivityLog();
        log.setLeadId(leadId);
        log.setAction(action);
        log.setDetails(details);
        log.setUserEmail(userEmail);
        activityLogRepository.save(log);
        logger.info("Activity logged: {} for lead {}", action, leadId);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getLeadActivity(Long leadId) {
        return activityLogRepository.findByLeadIdOrderByCreatedAtDesc(leadId);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getAllActivity(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}