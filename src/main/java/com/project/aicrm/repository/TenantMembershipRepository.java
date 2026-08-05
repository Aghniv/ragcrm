package com.project.aicrm.repository;

import com.project.aicrm.entity.TenantMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantMembershipRepository extends JpaRepository<TenantMembership, Long> {
    List<TenantMembership> findByUserId(Long userId);
    Optional<TenantMembership> findByUserIdAndTenantId(Long userId, Long tenantId);
    boolean existsByUserIdAndTenantId(Long userId, Long tenantId);
}
