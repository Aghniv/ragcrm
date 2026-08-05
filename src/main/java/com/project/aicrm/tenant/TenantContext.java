package com.project.aicrm.tenant;

/**
 * ThreadLocal holder for the current request's tenant id.
 * Set by {@link TenantInterceptor}; cleared after the request.
 *
 * Repositories that want tenant-scoped queries read from here.
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT = new ThreadLocal<>();

    private TenantContext() {}

    public static void set(Long tenantId) {
        CURRENT.set(tenantId);
    }

    public static Long get() {
        return CURRENT.get();
    }

    public static Long require() {
        Long id = CURRENT.get();
        if (id == null) {
            throw new IllegalStateException(
                "No tenant in context. Set X-Tenant-Id header or include tenantId in JWT."
            );
        }
        return id;
    }

    public static void clear() {
        CURRENT.remove();
    }
}
