package com.project.aicrm.repository;

import com.project.aicrm.entity.Opportunity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    Optional<Opportunity> findByIdAndTenantId(Long id, Long tenantId);
    Page<Opportunity> findByTenantId(Long tenantId, Pageable pageable);
    Page<Opportunity> findByTenantIdAndStage(Long tenantId, Opportunity.Stage stage, Pageable pageable);
    List<Opportunity> findByTenantIdAndCustomerId(Long tenantId, Long customerId);
    long countByTenantId(Long tenantId);
    long countByTenantIdAndStage(Long tenantId, Opportunity.Stage stage);
    @org.springframework.data.jpa.repository.Query(
        "SELECT COALESCE(SUM(o.amount), 0) FROM Opportunity o WHERE o.tenantId = :tenantId AND o.stage NOT IN ('WON','LOST')")
    BigDecimal sumOpenPipelineByTenant(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);
    @org.springframework.data.jpa.repository.Query(
        "SELECT COALESCE(SUM(o.amount), 0) FROM Opportunity o WHERE o.tenantId = :tenantId AND o.stage = 'WON'")
    BigDecimal sumWonByTenant(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);
}
