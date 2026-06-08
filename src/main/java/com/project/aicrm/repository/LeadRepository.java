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

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByStatus(LeadStatus status);
    List<Lead> findByCompanyContainingIgnoreCase(String company);

    Page<Lead> findByStatus(LeadStatus status, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.name LIKE %:search% OR l.email LIKE %:search% OR l.company LIKE %:search%")
    Page<Lead> searchLeads(@Param("search") String search, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.status = :status AND (l.name LIKE %:search% OR l.email LIKE %:search% OR l.company LIKE %:search%)")
    Page<Lead> findByStatusAndSearch(@Param("status") LeadStatus status, @Param("search") String search, Pageable pageable);
}