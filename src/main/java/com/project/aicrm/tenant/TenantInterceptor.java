package com.project.aicrm.tenant;

import com.project.aicrm.config.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Resolves the current tenant for a request in this order:
 *   1. X-Tenant-Id header (if present and valid)
 *   2. tenantId claim from the JWT
 *
 * The resolved id is stored in {@link TenantContext} for the duration of
 * the request, then cleared in {@code afterCompletion}.
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public TenantInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        try {
            Long tenantId = resolveTenantId(request);
            if (tenantId != null) {
                TenantContext.set(tenantId);
            }
        } catch (Exception e) {
            // No auth or invalid token — let the security filter chain reject it.
            TenantContext.clear();
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        TenantContext.clear();
    }

    private Long resolveTenantId(HttpServletRequest request) {
        // 1) Header (explicit, takes precedence)
        String header = request.getHeader("X-Tenant-Id");
        if (header != null && !header.isBlank()) {
            try {
                return Long.parseLong(header.trim());
            } catch (NumberFormatException ignored) { /* fall through */ }
        }

        // 2) JWT claim
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                Long fromClaim = jwtUtil.extractTenantId(token);
                if (fromClaim != null) return fromClaim;
            }
        }
        return null;
    }
}
