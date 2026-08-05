package com.project.aicrm.tenant;

import com.project.aicrm.config.JwtUtil;
import com.project.aicrm.entity.User;
import com.project.aicrm.repository.TenantMembershipRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Service-layer helper: "is the current user a member of the given tenant,
 * and if so what role do they have there?"
 */
@Component
public class TenantSecurity {

    private final TenantMembershipRepository membershipRepository;
    private final JwtUtil jwtUtil;

    public TenantSecurity(TenantMembershipRepository membershipRepository, JwtUtil jwtUtil) {
        this.membershipRepository = membershipRepository;
        this.jwtUtil = jwtUtil;
    }

    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User u)) {
            throw new IllegalStateException("No authenticated user in security context");
        }
        return u;
    }

    public Long currentUserId() {
        return currentUser().getId();
    }

    public boolean isMember(Long tenantId, Long userId) {
        return membershipRepository.existsByUserIdAndTenantId(userId, tenantId);
    }

    public boolean isMemberOfCurrentTenant() {
        return isMember(TenantContext.require(), currentUserId());
    }

    public void requireMemberOfCurrentTenant() {
        if (!isMemberOfCurrentTenant()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "User is not a member of tenant " + TenantContext.require());
        }
    }

    public String roleIn(Long tenantId, Long userId) {
        return membershipRepository.findByUserIdAndTenantId(userId, tenantId)
                .map(m -> m.getRole())
                .orElse(null);
    }

    /**
     * Mint a fresh JWT that includes a tenantId claim.
     * Use this whenever the user takes an action that should be scoped to a specific tenant.
     */
    public String issueTenantToken(Long tenantId) {
        User u = currentUser();
        return jwtUtil.generateToken(u.getEmail(), u.getId(), u.getRole().name(), tenantId);
    }
}
