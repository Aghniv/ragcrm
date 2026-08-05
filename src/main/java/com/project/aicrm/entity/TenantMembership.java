package com.project.aicrm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_memberships",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tenant_id"}),
       indexes = {
           @Index(name = "idx_membership_user", columnList = "user_id"),
           @Index(name = "idx_membership_tenant", columnList = "tenant_id")
       })
public class TenantMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    /**
     * Per-tenant role. Global {@link User#getRole()} is ADMIN/USER;
     * this is a finer-grained role inside the tenant (OWNER, ADMIN, MEMBER, VIEWER).
     */
    @Column(nullable = false, length = 32)
    private String role = "MEMBER";

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
