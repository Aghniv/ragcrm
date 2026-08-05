package com.project.aicrm.repository;

import com.project.aicrm.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    Optional<Contact> findByIdAndTenantId(Long id, Long tenantId);
    Page<Contact> findByTenantId(Long tenantId, Pageable pageable);
    List<Contact> findByTenantIdAndCustomerId(Long tenantId, Long customerId);
    long countByTenantId(Long tenantId);
}
