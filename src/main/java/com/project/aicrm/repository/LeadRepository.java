package com.project.aicrm.repository;

import com.project.aicrm.entity.Lead;
import com.project.aicrm.entity.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Tenant-scoped queries (use these from the service layer)
    Optional<Lead> findByIdAndTenantId(Long id, Long tenantId);

    Page<Lead> findByTenantId(Long tenantId, Pageable pageable);

    Page<Lead> findByTenantIdAndStatus(Long tenantId, LeadStatus status, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.tenantId = :tenantId AND (l.name LIKE %:search% OR l.email LIKE %:search% OR l.company LIKE %:search%)")
    Page<Lead> searchByTenant(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.tenantId = :tenantId AND l.status = :status AND (l.name LIKE %:search% OR l.email LIKE %:search% OR l.company LIKE %:search%)")
    Page<Lead> searchByTenantAndStatus(@Param("tenantId") Long tenantId, @Param("status") LeadStatus status, @Param("search") String search, Pageable pageable);

    List<Lead> findByTenantIdAndStatus(Long tenantId, LeadStatus status);

    long countByTenantId(Long tenantId);
    long countByTenantIdAndStatus(Long tenantId, LeadStatus status);

    /** Latest leads created in this tenant — used by the dashboard. */
    List<Lead> findTop10ByTenantIdOrderByCreatedAtDesc(Long tenantId);

    /** Highest-scoring leads in this tenant — used by the dashboard. */
    @Query("SELECT l FROM Lead l WHERE l.tenantId = :tenantId AND l.score IS NOT NULL ORDER BY l.score DESC")
    List<Lead> findTop10ByTenantIdOrderByScoreDesc(@Param("tenantId") Long tenantId);
}