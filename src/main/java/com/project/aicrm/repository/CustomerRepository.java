package com.project.aicrm.repository;

import com.project.aicrm.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByIdAndTenantId(Long id, Long tenantId);
    Page<Customer> findByTenantId(Long tenantId, Pageable pageable);
    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.industry) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Customer> searchByTenant(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);
    long countByTenantId(Long tenantId);
}
