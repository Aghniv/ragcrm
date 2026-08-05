package com.project.aicrm.controller;

import com.project.aicrm.entity.Tenant;
import com.project.aicrm.entity.TenantMembership;
import com.project.aicrm.entity.User;
import com.project.aicrm.repository.TenantMembershipRepository;
import com.project.aicrm.repository.TenantRepository;
import com.project.aicrm.tenant.TenantSecurity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantRepository tenantRepository;
    private final TenantMembershipRepository membershipRepository;
    private final TenantSecurity tenantSecurity;

    public TenantController(TenantRepository tenantRepository,
                            TenantMembershipRepository membershipRepository,
                            TenantSecurity tenantSecurity) {
        this.tenantRepository = tenantRepository;
        this.membershipRepository = membershipRepository;
        this.tenantSecurity = tenantSecurity;
    }

    /**
     * Self-service tenant creation. The creator becomes the OWNER.
     * Returns the new tenant and a fresh JWT that includes the tenantId claim
     * so subsequent calls don't need to send X-Tenant-Id.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createTenant(@Valid @RequestBody CreateTenantRequest req) {
        User user = tenantSecurity.currentUser();

        if (tenantRepository.existsBySlug(req.slug())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slug already taken"));
        }

        Tenant tenant = new Tenant();
        tenant.setSlug(req.slug());
        tenant.setName(req.name());
        tenant.setPlan("FREE");
        tenant.setActive(true);
        tenant = tenantRepository.save(tenant);

        TenantMembership membership = new TenantMembership();
        membership.setUserId(user.getId());
        membership.setTenantId(tenant.getId());
        membership.setRole("OWNER");
        membershipRepository.save(membership);

        // Issue a fresh JWT scoped to this tenant
        String token = tenantSecurity.issueTenantToken(tenant.getId());

        Map<String, Object> body = new HashMap<>();
        body.put("tenant", tenant);
        body.put("token", token);
        body.put("membership", Map.of(
                "role", membership.getRole(),
                "tenantId", tenant.getId()
        ));
        return ResponseEntity.ok(body);
    }

    /** List the tenants the current user belongs to. */
    @GetMapping("/mine")
    public ResponseEntity<List<Map<String, Object>>> myTenants() {
        User user = tenantSecurity.currentUser();
        List<TenantMembership> memberships = membershipRepository.findByUserId(user.getId());
        List<Map<String, Object>> result = memberships.stream()
                .map(m -> {
                    Tenant t = tenantRepository.findById(m.getTenantId()).orElse(null);
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("id", m.getTenantId());
                    entry.put("role", m.getRole());
                    if (t != null) {
                        entry.put("slug", t.getSlug());
                        entry.put("name", t.getName());
                        entry.put("plan", t.getPlan());
                    }
                    return entry;
                })
                .toList();
        return ResponseEntity.ok(result);
    }

    public record CreateTenantRequest(
            @NotBlank
            @Size(min = 3, max = 64)
            @Pattern(regexp = "^[a-z0-9][a-z0-9-]*$",
                     message = "slug must be lowercase letters, digits, and dashes; cannot start with a dash")
            String slug,
            @NotBlank @Size(min = 1, max = 200) String name
    ) {}
}
